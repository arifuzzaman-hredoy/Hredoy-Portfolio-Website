FROM golang:1.24-alpine AS builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o /out/portfolio ./cmd/portfolio

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/portfolio /app/portfolio
COPY --from=builder /src/db/migrations /app/db/migrations
EXPOSE 8080
ENTRYPOINT ["/app/portfolio"]
