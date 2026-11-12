FROM golang:1.25-alpine AS build

RUN apk add --no-cache build-base sqlite-dev
WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=1 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/hazelwood ./cmd/server

FROM alpine:3.23

RUN apk add --no-cache ca-certificates sqlite-libs ffmpeg \
    && addgroup -S app \
    && adduser -S -G app app \
    && mkdir -p /data \
    && chown app:app /data
WORKDIR /app
COPY --from=build /out/hazelwood /usr/local/bin/hazelwood
COPY web ./web
ENV WEB_DIR=/app/web
USER app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/hazelwood"]
