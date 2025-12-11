# Course Service Dockerfile (JAX-WS) - multi-stage
FROM eclipse-temurin:17-jdk AS build

WORKDIR /workspace
COPY src ./src
COPY lib ./lib
COPY jaxws-ri ./jaxws-ri

RUN mkdir -p out && \
    javac -cp "lib/*:jaxws-ri/lib/*" -d out $(find src -name "*.java")

FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

COPY --from=build /workspace/out ./out
COPY --from=build /workspace/lib ./lib
COPY --from=build /workspace/jaxws-ri ./jaxws-ri

EXPOSE 8200

CMD ["java", "--add-opens", "java.base/jdk.internal.misc=ALL-UNNAMED", "--add-opens", "java.base/java.lang=ALL-UNNAMED", "-cp", "out:lib/*:jaxws-ri/lib/*", "com.university.course.CoursePublisher"]
