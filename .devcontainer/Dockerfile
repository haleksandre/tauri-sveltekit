# Bun
FROM docker.io/oven/bun:1-debian as bun


# Node
FROM docker.io/library/node:20-bookworm as node

RUN corepack enable && \
    corepack prepare pnpm@latest-9 --activate


# Android
FROM docker.io/thyrlian/android-sdk:latest as android

ARG BUILD=30.0.3
ARG NDK=27.0.11718014

ENV NDK_HOME=${ANDROID_HOME}/ndk

# "platforms;android-30" \
# "platforms;android-31" \
RUN yes | ${ANDROID_HOME}/cmdline-tools/tools/bin/sdkmanager --licenses && \
    ${ANDROID_HOME}/cmdline-tools/tools/bin/sdkmanager --install \
      "platforms;android-32" \
      "platforms;android-33" \
      "platforms;android-34" \
      "platform-tools" \
      "ndk;${NDK}" \
      "build-tools;${BUILD}" \
      "cmdline-tools;latest" 



# iOS
FROM docker.io/homebrew/brew:latest as brew


# Tauri
FROM mcr.microsoft.com/devcontainers/rust:1-bookworm

ARG NDK=27.0.11718014

ARG PUID=1000
ARG PGID=1000

ENV ANDROID_HOME /opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV NDK_HOME=${ANDROID_HOME}/ndk/${NDK}/

ENV PATH "$PATH:/home/linuxbrew/.linuxbrew/Homebrew/bin:/opt/gradle/bin:/opt/kotlinc/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/cmdline-tools/tools/bin:/opt/android-sdk/platform-tools:/opt/android-sdk/emulator"

ENV UID=1000

# COPY --from=android --chown 1000:1000 /opt/android-sdk /opt/android-sdk
COPY --from=android --chown=1000:1000 ${ANDROID_HOME} ${ANDROID_HOME}
COPY --from=android --chown=1000:1000 ${JAVA_HOME} ${JAVA_HOME}
COPY --from=android --chown=1000:1000 /opt/gradle /opt/gradle
COPY --from=android --chown=1000:1000 /opt/kotlinc /opt/kotlinc

COPY --from=brew --chown=1000:1000 /home/linuxbrew/.linuxbrew /home/linuxbrew/.linuxbrew

COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun /usr/local/bin/bunx /usr/local/bin/bunx

RUN ln -s /home/linuxbrew/.linuxbrew/Homebrew/bin/brew /usr/local/bin/brew

RUN apt-get update && \ 
    apt-get install -y --no-install-recommends \ 
      openjdk-17-jdk \
      libwebkit2gtk-4.1-dev \
      libcanberra-gtk-module \
      libcanberra-gtk3-module \
      dbus-user-session \
      build-essential \
      curl \
      wget \
      file \
      procps \
      libssl-dev \
      libayatana-appindicator3-dev \
      librsvg2-dev \
      git \
      git-lfs && \
      apt-get clean && rm -rf /var/lib/apt/lists/*

      # Mobile
RUN rustup target add \
      aarch64-linux-android \
      armv7-linux-androideabi \
      i686-linux-android \
      x86_64-linux-android \
      aarch64-apple-ios \
      x86_64-apple-ios \
      aarch64-apple-ios-sim
      
# Frontend
RUN bun x playwright install --with-deps
