package app

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
)

const passwordIterations = 310_000

func hashPassword(password string) (saltHex, hashHex string, err error) {
	salt := make([]byte, 16)
	if _, err = rand.Read(salt); err != nil {
		return "", "", err
	}
	derived := pbkdf2SHA256([]byte(password), salt, passwordIterations, sha256.Size)
	return hex.EncodeToString(salt), hex.EncodeToString(derived), nil
}

func verifyPassword(password, saltHex, expectedHex string) bool {
	salt, err := hex.DecodeString(saltHex)
	if err != nil || len(salt) < 16 {
		return false
	}
	expected, err := hex.DecodeString(expectedHex)
	if err != nil || len(expected) != sha256.Size {
		return false
	}
	actual := pbkdf2SHA256([]byte(password), salt, passwordIterations, len(expected))
	return subtle.ConstantTimeCompare(actual, expected) == 1
}

func pbkdf2SHA256(password, salt []byte, iterations, keyLength int) []byte {
	if iterations < 1 || keyLength < 1 {
		return nil
	}
	blocks := (keyLength + sha256.Size - 1) / sha256.Size
	derived := make([]byte, 0, blocks*sha256.Size)
	for block := 1; block <= blocks; block++ {
		mac := hmac.New(sha256.New, password)
		_, _ = mac.Write(salt)
		_, _ = mac.Write([]byte{byte(block >> 24), byte(block >> 16), byte(block >> 8), byte(block)})
		u := mac.Sum(nil)
		t := append([]byte(nil), u...)
		for i := 1; i < iterations; i++ {
			mac = hmac.New(sha256.New, password)
			_, _ = mac.Write(u)
			u = mac.Sum(nil)
			for j := range t {
				t[j] ^= u[j]
			}
		}
		derived = append(derived, t...)
	}
	if len(derived) < keyLength {
		return nil
	}
	return derived[:keyLength]
}
