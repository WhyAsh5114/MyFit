FROM mcr.microsoft.com/devcontainers/javascript-node:3-22-bookworm

# Layer 1: Update and upgrade system packages
RUN apt-get update && apt-get upgrade -y

# Layer 2: Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Layer 3: Switch to node user (better security practice)
USER node

# Layer 4: Install Playwright with dependencies
RUN pnpx playwright install --with-deps

# Switch to root to install packages
USER root

# Layer 6: Install packages needed for Android development and Adoptium JDK 21
RUN apt-get update && \
    apt-get install -y wget unzip curl && \
    # Install Adoptium JDK 21
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | apt-key add - && \
    echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list && \
    apt-get update && \
    apt-get install -y temurin-21-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch to node user again for env var setup
USER node

# Layer 7: Setup Android SDK environment variables
ENV JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
ENV ANDROID_HOME=/home/node/Android/sdk
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin

# Layer 8: Create Android SDK directory and download command line tools
RUN mkdir -p $ANDROID_HOME && \
    cd /home/node && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip && \
    unzip -q commandlinetools-linux-13114758_latest.zip && \
    mkdir -p $ANDROID_HOME/cmdline-tools && \
    mv cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm commandlinetools-linux-13114758_latest.zip

# Layer 9: Install Android SDK components
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "platforms;android-35" "build-tools;35.0.0" \
    "emulator" "system-images;android-36;google_apis_playstore;x86_64" "system-images;android-35;google_apis_playstore;x86_64"

# Layer 10: Create Android Virtual Device
RUN echo "no" | avdmanager create avd -n "Pixel_API_36" -k "system-images;android-36;google_apis_playstore;x86_64" --device "pixel_7"

# Switch back to root for KVM setup
USER root

# Layer 11: Setup KVM for hardware acceleration
RUN apt-get update && \
    apt-get install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    groupadd -f kvm && usermod -a -G kvm node
