# Step 1: Use a lightweight JRE base image to minimize final size
FROM eclipse-temurin:17-jre-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the built JAR into the container (Adjust path if using Gradle)
COPY target/*.jar app.jar

# Step 4: Expose the port your Spring Boot app runs on
EXPOSE 8081

# Step 5: Define the command to execute your application
ENTRYPOINT ["java", "-jar", "app.jar"]