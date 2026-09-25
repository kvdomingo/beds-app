ARG UV_VERSION=0.12
FROM astral/uv:${UV_VERSION} AS uv

FROM python:3.14-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PUID=1000
ENV PGID=1000
ENV UV_LINK_MODE=copy
ENV UV_COMPILE_BYTECODE=false

SHELL [ "/bin/bash", "-euxo", "pipefail", "-c" ]

# hadolint ignore=DL3009
RUN apt-get update && \
    apt-get install \
        curl \
        ca-certificates \
        apt-transport-https \
        -y --no-install-recommends && \
    useradd --user-group --uid ${PUID} --create-home app && \
    mkdir -p /app && \
    chown -R ${PUID}:${PGID} /app /home/app

COPY --from=uv /uv /uvx /bin/

WORKDIR /app

USER ${PUID}

ENTRYPOINT [ "/bin/bash", "-euxo", "pipefail", "-c" ]
