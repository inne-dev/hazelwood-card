plugins {
    java
}

group = "space.inne.hazelwood"
version = "1.0.2"

repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
    maven("https://repo.codemc.org/repository/maven-public/")
    maven("https://repo.lucko.me/")
    maven("https://jitpack.io")
}

dependencies {
    compileOnly("io.papermc.paper:paper-api:26.3.build.157-beta")
    compileOnly("com.github.valkdzx:CDisc-Music:2.2.2")
    compileOnly("net.luckperms:api:5.4")
    compileOnly("net.skinsrestorer:skinsrestorer-api:15.12.6")
    testImplementation("io.papermc.paper:paper-api:26.3.build.157-beta")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.11.4")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(25))
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
}

tasks.test {
    useJUnitPlatform()
}

tasks.jar {
    archiveFileName.set("HazelwoodAuth.jar")
}
