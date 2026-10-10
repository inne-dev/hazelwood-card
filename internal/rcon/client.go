package rcon

import (
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"net"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const maxPacketSize = 4096

type Client struct {
	address  string
	password string
	timeout  time.Duration
}

type Status struct {
	OnlineCount int
	MaxPlayers  int
	Players     []string
}

func New(address, password string) *Client {
	return &Client{address: address, password: password, timeout: 5 * time.Second}
}

func (c *Client) Command(ctx context.Context, command string) (string, error) {
	if len(command) > 1400 || strings.ContainsAny(command, "\x00\r\n") {
		return "", errors.New("invalid RCON command")
	}
	dialer := net.Dialer{Timeout: c.timeout}
	conn, err := dialer.DialContext(ctx, "tcp", c.address)
	if err != nil {
		return "", fmt.Errorf("RCON connect: %w", err)
	}
	defer conn.Close()
	deadline := time.Now().Add(c.timeout)
	if contextDeadline, ok := ctx.Deadline(); ok && contextDeadline.Before(deadline) {
		deadline = contextDeadline
	}
	_ = conn.SetDeadline(deadline)

	if err := writePacket(conn, 1, 3, c.password); err != nil {
		return "", fmt.Errorf("RCON auth write: %w", err)
	}
	auth, err := readPacket(conn)
	if err != nil {
		return "", fmt.Errorf("RCON auth response: %w", err)
	}
	if auth.id == -1 {
		return "", errors.New("RCON authentication failed")
	}
	if auth.id != 1 {
		return "", errors.New("unexpected RCON auth response")
	}
	if err := writePacket(conn, 2, 2, command); err != nil {
		return "", fmt.Errorf("RCON command write: %w", err)
	}
	response, err := readPacket(conn)
	if err != nil {
		return "", fmt.Errorf("RCON command response: %w", err)
	}
	if response.id != 2 {
		return "", errors.New("unexpected RCON command response")
	}
	return response.body, nil
}

func (c *Client) List(ctx context.Context) (Status, error) {
	response, err := c.Command(ctx, "list")
	if err != nil {
		return Status{}, err
	}
	return ParseList(response)
}

type packet struct {
	id   int32
	body string
}

func writePacket(w io.Writer, id, kind int32, body string) error {
	length := 4 + 4 + len(body) + 2
	if length > maxPacketSize {
		return errors.New("RCON packet too large")
	}
	packet := make([]byte, 4+length)
	binary.LittleEndian.PutUint32(packet[0:4], uint32(length))
	binary.LittleEndian.PutUint32(packet[4:8], uint32(id))
	binary.LittleEndian.PutUint32(packet[8:12], uint32(kind))
	copy(packet[12:], body)
	return writeAll(w, packet)
}

func readPacket(r io.Reader) (packet, error) {
	var header [4]byte
	if _, err := io.ReadFull(r, header[:]); err != nil {
		return packet{}, err
	}
	length := int(binary.LittleEndian.Uint32(header[:]))
	if length < 10 || length > maxPacketSize {
		return packet{}, fmt.Errorf("invalid RCON packet length %d", length)
	}
	body := make([]byte, length)
	if _, err := io.ReadFull(r, body); err != nil {
		return packet{}, err
	}
	if body[length-1] != 0 || body[length-2] != 0 {
		return packet{}, errors.New("malformed RCON packet terminator")
	}
	return packet{
		id:   int32(binary.LittleEndian.Uint32(body[0:4])),
		body: string(body[8 : length-2]),
	}, nil
}

func writeAll(w io.Writer, data []byte) error {
	for len(data) != 0 {
		n, err := w.Write(data)
		if err != nil {
			return err
		}
		if n == 0 {
			return io.ErrShortWrite
		}
		data = data[n:]
	}
	return nil
}

var listPattern = regexp.MustCompile(`(?i)(?:there are|there is)\s+(\d+)\s+of a max of\s+(\d+)\s+players online(?:\s*:\s*(.*))?`)
var usernamePattern = regexp.MustCompile(`^[A-Za-z0-9_]{3,16}$`)

func ParseList(response string) (Status, error) {
	match := listPattern.FindStringSubmatch(strings.TrimSpace(response))
	if len(match) == 0 {
		return Status{}, fmt.Errorf("unrecognized RCON list response: %q", response)
	}
	count, err := strconv.Atoi(match[1])
	if err != nil {
		return Status{}, fmt.Errorf("parse online count: %w", err)
	}
	maxPlayers, err := strconv.Atoi(match[2])
	if err != nil {
		return Status{}, fmt.Errorf("parse max players: %w", err)
	}
	players := make([]string, 0, count)
	if len(match) > 3 && strings.TrimSpace(match[3]) != "" {
		for _, name := range strings.Split(match[3], ",") {
			name = strings.TrimSpace(name)
			if usernamePattern.MatchString(name) {
				players = append(players, name)
			}
		}
	}
	return Status{OnlineCount: count, MaxPlayers: maxPlayers, Players: players}, nil
}
