FROM eclipse-temurin:21-jdk

# Maven
ENV MAVEN_VERSION=3.9.9
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -fsSL https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz \
      | tar -xz -C /opt && \
    ln -s /opt/apache-maven-$MAVEN_VERSION/bin/mvn /usr/local/bin/mvn && \
    rm -rf /var/lib/apt/lists/*

# Node
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./

# Pre-warm Maven dependency cache for Paper
RUN mkdir -p /tmp/warmup && cd /tmp/warmup && \
    mvn -q archetype:generate -DgroupId=warm -DartifactId=warm -Dversion=1 -DinteractiveMode=false || true

EXPOSE 8787
CMD ["node", "server.js"]
