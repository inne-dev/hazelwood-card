package store

/*
#cgo pkg-config: sqlite3
#include <sqlite3.h>
#include <stdlib.h>

static int hw_bind_text(sqlite3_stmt *stmt, int index, const char *value) {
	return sqlite3_bind_text(stmt, index, value, -1, SQLITE_TRANSIENT);
}
*/
import "C"

import (
	"errors"
	"fmt"
	"sync"
	"unsafe"
)

// DB is a small, serialized SQLite connection. SQLite does the disk work;
// serializing calls keeps transactions simple and avoids a connection pool.
type DB struct {
	mu   sync.Mutex
	conn *C.sqlite3
}

type Tx struct{ db *DB }

type Row []any

func Open(path string) (*DB, error) {
	cpath := C.CString(path)
	defer C.free(unsafe.Pointer(cpath))

	var conn *C.sqlite3
	rc := C.sqlite3_open_v2(cpath, &conn, C.SQLITE_OPEN_READWRITE|C.SQLITE_OPEN_CREATE|C.SQLITE_OPEN_FULLMUTEX, nil)
	if rc != C.SQLITE_OK {
		msg := "sqlite open failed"
		if conn != nil {
			msg = C.GoString(C.sqlite3_errmsg(conn))
			C.sqlite3_close_v2(conn)
		}
		return nil, fmt.Errorf("sqlite open: %s", msg)
	}
	db := &DB{conn: conn}
	C.sqlite3_busy_timeout(conn, 5000)
	if _, err := db.Query("PRAGMA journal_mode=WAL"); err != nil {
		db.Close()
		return nil, err
	}
	for _, q := range []string{"PRAGMA synchronous=NORMAL", "PRAGMA foreign_keys=ON"} {
		if _, _, err := db.Exec(q); err != nil {
			db.Close()
			return nil, err
		}
	}
	return db, nil
}

func (db *DB) Close() error {
	db.mu.Lock()
	defer db.mu.Unlock()
	if db.conn == nil {
		return nil
	}
	rc := C.sqlite3_close_v2(db.conn)
	if rc != C.SQLITE_OK {
		return db.err(rc)
	}
	db.conn = nil
	return nil
}

func (db *DB) Exec(query string, args ...any) (int64, int64, error) {
	db.mu.Lock()
	defer db.mu.Unlock()
	return db.execLocked(query, args...)
}

func (db *DB) Query(query string, args ...any) ([]Row, error) {
	db.mu.Lock()
	defer db.mu.Unlock()
	return db.queryLocked(query, args...)
}

func (db *DB) QueryOne(query string, args ...any) (Row, bool, error) {
	rows, err := db.Query(query, args...)
	if err != nil || len(rows) == 0 {
		return nil, false, err
	}
	return rows[0], true, nil
}

func (db *DB) WithTx(fn func(*Tx) error) (err error) {
	db.mu.Lock()
	defer db.mu.Unlock()
	if _, _, err = db.execLocked("BEGIN IMMEDIATE"); err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_, _, _ = db.execLocked("ROLLBACK")
		}
	}()
	if err = fn(&Tx{db: db}); err != nil {
		return err
	}
	_, _, err = db.execLocked("COMMIT")
	return err
}

func (tx *Tx) Exec(query string, args ...any) (int64, int64, error) {
	return tx.db.execLocked(query, args...)
}

func (tx *Tx) Query(query string, args ...any) ([]Row, error) {
	return tx.db.queryLocked(query, args...)
}

func (tx *Tx) QueryOne(query string, args ...any) (Row, bool, error) {
	rows, err := tx.Query(query, args...)
	if err != nil || len(rows) == 0 {
		return nil, false, err
	}
	return rows[0], true, nil
}

func (db *DB) execLocked(query string, args ...any) (int64, int64, error) {
	stmt, err := db.prepareLocked(query, args...)
	if err != nil {
		return 0, 0, err
	}
	defer C.sqlite3_finalize(stmt)
	rc := C.sqlite3_step(stmt)
	if rc != C.SQLITE_DONE {
		return 0, 0, db.err(rc)
	}
	return int64(C.sqlite3_changes(db.conn)), int64(C.sqlite3_last_insert_rowid(db.conn)), nil
}

func (db *DB) queryLocked(query string, args ...any) ([]Row, error) {
	stmt, err := db.prepareLocked(query, args...)
	if err != nil {
		return nil, err
	}
	defer C.sqlite3_finalize(stmt)
	columns := int(C.sqlite3_column_count(stmt))
	rows := make([]Row, 0)
	for {
		rc := C.sqlite3_step(stmt)
		if rc == C.SQLITE_DONE {
			return rows, nil
		}
		if rc != C.SQLITE_ROW {
			return nil, db.err(rc)
		}
		row := make(Row, columns)
		for i := 0; i < columns; i++ {
			idx := C.int(i)
			switch C.sqlite3_column_type(stmt, idx) {
			case C.SQLITE_INTEGER:
				row[i] = int64(C.sqlite3_column_int64(stmt, idx))
			case C.SQLITE_FLOAT:
				row[i] = float64(C.sqlite3_column_double(stmt, idx))
			case C.SQLITE_TEXT:
				ptr := C.sqlite3_column_text(stmt, idx)
				row[i] = C.GoString((*C.char)(unsafe.Pointer(ptr)))
			case C.SQLITE_BLOB:
				ptr := C.sqlite3_column_blob(stmt, idx)
				n := C.sqlite3_column_bytes(stmt, idx)
				row[i] = C.GoBytes(ptr, n)
			default:
				row[i] = nil
			}
		}
		rows = append(rows, row)
	}
}

func (db *DB) prepareLocked(query string, args ...any) (*C.sqlite3_stmt, error) {
	if db.conn == nil {
		return nil, errors.New("sqlite connection is closed")
	}
	cquery := C.CString(query)
	defer C.free(unsafe.Pointer(cquery))
	var stmt *C.sqlite3_stmt
	rc := C.sqlite3_prepare_v2(db.conn, cquery, -1, &stmt, nil)
	if rc != C.SQLITE_OK {
		return nil, db.err(rc)
	}
	for i, arg := range args {
		index := C.int(i + 1)
		var bindRC C.int
		switch value := arg.(type) {
		case nil:
			bindRC = C.sqlite3_bind_null(stmt, index)
		case string:
			cvalue := C.CString(value)
			bindRC = C.hw_bind_text(stmt, index, cvalue)
			C.free(unsafe.Pointer(cvalue))
		case int:
			bindRC = C.sqlite3_bind_int64(stmt, index, C.sqlite3_int64(value))
		case int64:
			bindRC = C.sqlite3_bind_int64(stmt, index, C.sqlite3_int64(value))
		default:
			C.sqlite3_finalize(stmt)
			return nil, fmt.Errorf("unsupported sqlite argument type %T", arg)
		}
		if bindRC != C.SQLITE_OK {
			C.sqlite3_finalize(stmt)
			return nil, db.err(bindRC)
		}
	}
	return stmt, nil
}

func (db *DB) err(rc C.int) error {
	if db.conn == nil {
		return fmt.Errorf("sqlite error %d", int(rc))
	}
	return fmt.Errorf("sqlite: %s", C.GoString(C.sqlite3_errmsg(db.conn)))
}
