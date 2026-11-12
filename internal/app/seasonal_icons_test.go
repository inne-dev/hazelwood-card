package app

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestActiveSeasonalIconUsesPriorityAndInclusiveDates(t *testing.T) {
	seasons := []seasonalIconRule{
		{ID: "autumn", Start: "09-01", End: "11-23", Priority: 10, Icon: "autumn.png"},
		{ID: "halloween", Start: "10-24", End: "11-02", Priority: 20, Icon: "halloween.png"},
		{ID: "winter", Start: "11-24", End: "02-14", Priority: 10, Icon: "winter.png"},
		{ID: "new-year", Start: "12-24", End: "01-07", Priority: 30, Icon: "new-year.png"},
	}
	for _, test := range []struct {
		date string
		want string
	}{
		{date: "2026-09-01", want: "autumn.png"},
		{date: "2026-10-24", want: "halloween.png"},
		{date: "2026-11-03", want: "autumn.png"},
		{date: "2026-11-24", want: "winter.png"},
		{date: "2026-12-24", want: "new-year.png"},
		{date: "2027-01-07", want: "new-year.png"},
		{date: "2027-01-08", want: "winter.png"},
	} {
		t.Run(test.date, func(t *testing.T) {
			got, ok := activeSeasonalIcon(seasons, mustDate(t, test.date))
			if !ok || got.Icon != test.want {
				t.Fatalf("activeSeasonalIcon() = (%+v, %v), want %q", got, ok, test.want)
			}
		})
	}
}

func TestValidateSeasonalIconConfigRequiresSevenDaysAndSafeFiles(t *testing.T) {
	base := seasonalIconConfig{
		Timezone:           "UTC",
		MinimumDisplayDays: 7,
		Seasons:            []seasonalIconRule{{ID: "short", Start: "05-01", End: "05-06", Icon: "short.png"}},
	}
	if _, err := validateSeasonalIconConfig(base); err == nil {
		t.Fatal("expected six-day schedule to be rejected")
	}
	base.Seasons[0].End = "05-07"
	if _, err := validateSeasonalIconConfig(base); err != nil {
		t.Fatalf("seven-day schedule should be accepted: %v", err)
	}
	base.Seasons[0].Icon = "../outside.png"
	if _, err := validateSeasonalIconConfig(base); err == nil {
		t.Fatal("expected icon path traversal to be rejected")
	}
}

func TestSeasonalIconConfigAllowsYearWrappingWindow(t *testing.T) {
	config := seasonalIconConfig{
		Timezone:           "UTC",
		MinimumDisplayDays: 7,
		Seasons:            []seasonalIconRule{{ID: "winter", Start: "11-24", End: "02-14", Icon: "winter.png"}},
	}
	if _, err := validateSeasonalIconConfig(config); err != nil {
		t.Fatalf("year-wrapping window should be accepted: %v", err)
	}
}

func TestValidSeasonalPNGRequires64PixelPNG(t *testing.T) {
	var output bytes.Buffer
	if err := png.Encode(&output, image.NewRGBA(image.Rect(0, 0, 64, 64))); err != nil {
		t.Fatal(err)
	}
	if !validSeasonalPNG(output.Bytes()) {
		t.Fatal("valid 64x64 PNG was rejected")
	}
	if validSeasonalPNG([]byte("not an image")) {
		t.Fatal("invalid PNG was accepted")
	}
}

func TestSeasonalIconHandlerServesSelectedPNGWithoutCaching(t *testing.T) {
	webDir := t.TempDir()
	brandDir := filepath.Join(webDir, "assets", "brand")
	if err := os.MkdirAll(brandDir, 0o700); err != nil {
		t.Fatal(err)
	}
	want := solidPNG(t, color.RGBA{R: 18, G: 98, B: 36, A: 255})
	if err := os.WriteFile(filepath.Join(brandDir, "winter.png"), want, 0o600); err != nil {
		t.Fatal(err)
	}
	config := `{"timezone":"UTC","minimumDisplayDays":7,"seasons":[{"id":"winter","start":"01-01","end":"12-31","priority":1,"icon":"winter.png"}]}`
	if err := os.WriteFile(filepath.Join(brandDir, "seasonal-icons.json"), []byte(config), 0o600); err != nil {
		t.Fatal(err)
	}

	app := &App{webDir: webDir, logger: log.New(io.Discard, "", 0)}
	response := httptest.NewRecorder()
	app.handleSeasonalIcon(response, httptest.NewRequest(http.MethodGet, "/api/seasonal-icon", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if response.Header().Get("Content-Type") != "image/png" {
		t.Fatalf("content type = %q, want image/png", response.Header().Get("Content-Type"))
	}
	if response.Header().Get("Cache-Control") != "no-store, no-cache, must-revalidate" {
		t.Fatalf("cache control = %q", response.Header().Get("Cache-Control"))
	}
	if !bytes.Equal(response.Body.Bytes(), want) {
		t.Fatal("handler did not return the active seasonal icon")
	}
}

func solidPNG(t *testing.T, fill color.RGBA) []byte {
	t.Helper()
	imageData := image.NewRGBA(image.Rect(0, 0, 64, 64))
	for y := 0; y < 64; y++ {
		for x := 0; x < 64; x++ {
			imageData.SetRGBA(x, y, fill)
		}
	}
	var output bytes.Buffer
	if err := png.Encode(&output, imageData); err != nil {
		t.Fatal(err)
	}
	return output.Bytes()
}

func mustDate(t *testing.T, value string) time.Time {
	t.Helper()
	date, err := time.Parse(time.DateOnly, value)
	if err != nil {
		t.Fatal(err)
	}
	return date
}
