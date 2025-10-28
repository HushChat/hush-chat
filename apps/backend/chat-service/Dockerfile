FROM eclipse-temurin:21-jdk-jammy

# Dependency added for apache poi to generate excel files
RUN apt-get update && apt-get install -y fontconfig libfreetype6 && rm -rf /var/lib/apt/lists/*

# Copy the JAR file
COPY target/chat-1.0-SNAPSHOT.jar /app.jar

ENV ACTIVE_SPRING_PROFILES=${ACTIVE_SPRING_PROFILES}
EXPOSE 3092 5080

COPY ./src/main/resources/logback-spring.xml /app/logback-spring.xml
ENTRYPOINT ["java", \
            "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5080", \
            "-jar", \
            "-Dspring.profiles.active=${ACTIVE_SPRING_PROFILES}", \
            "-Dlogging.config=/app/logback-spring.xml", \
            "/app.jar"]