# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder
WORKDIR /src/backend
COPY backend/go.mod backend/go.sum* ./
RUN go mod download
COPY backend/ ./
COPY database/migrations/ /src/database/migrations/
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o /out/portfolio ./cmd/portfolio

# Pre-create the upload directory owned by the distroless nonroot user (65532)
# so the named volume inherits writable permissions on first use.
FROM alpine:3.20 AS dirs
RUN mkdir -p /uploads && chown 65532:65532 /uploads

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/portfolio /app/portfolio
COPY --from=builder /src/database/migrations /app/db/migrations
COPY --from=dirs /uploads /app/uploads
EXPOSE 8080
ENTRYPOINT ["/app/portfolio"]