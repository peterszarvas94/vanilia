FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/ cmd/
RUN CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o /out/app ./cmd/server

FROM alpine:3.22
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /out/app ./app
COPY templates/ ./templates/
COPY dist/ ./dist/
COPY static/ ./static/
COPY assets/ ./assets/
USER 10001:10001
EXPOSE 3000
CMD ["./app"]
