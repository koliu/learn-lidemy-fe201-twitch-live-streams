const gulp = require("gulp");
const $ = require("gulp-load-plugins")();
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const gulpDebug = require("gulp-debug");
const gulpSequence = require("gulp-sequence");
const mainBowerFiles = require("main-bower-files");
const minimist = require("minimist");

// Path Parameters
const src_paths = {
    jade: "./src/**/*.jade",
    scss: "./src/sass/*.scss",
    js: "./src/js/**/*.js",
    img: "./src/images/*",
    _static: ["./src/**/*.md"]
};
const public_path = "./publish/";
const publish_paths = {
    root: public_path,
    js: public_path + "js",
    css: public_path + "css"
};
const tmp_path = "./.tmp/";

// env params
const envs = {
    prod: "prod",
    dev: "dev"
};
// for minimist
const envOptions = {
    string: "env",
    default: {
        env: envs.dev
    }
};

// log result of minimist
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

const isInEnv = env => {
    return options.env === env;
};
const pipeByEnv = (env, fn) => {
    return $.if(isInEnv(env), fn);
};
const isProd = isInEnv(envs.prod);

// 1. run 'clean'
// 2. run 'jade', 'scss', 'image-min' in parallel;  after 'clean';
// 3. run 'babel' after 'jade', 'scss', 'image-min';
// 4. run 'vendorsJs' after 'babel'.
gulp.task(
    "prod",
    gulpSequence("clean", ["copy-static", "jade", "scss"], "babel", "vendorsJs")
);

// default task
gulp.task(
    "default",
    gulpSequence(
        "clean", ["copy-static", "scss", "jade"],
        "babel",
        "vendorsJs",
        "browser-sync",
        "watch"
    )
);

gulp.task("babel", () => {
    gulp
        .src(src_paths.js)
        .pipe($.sourcemaps.init())
        // .pipe($.babel({
        //     presets: ['env']
        // }))
        // .pipe($.concat("all.js"))
        // .pipe(pipeByEnv(envs.prod, $.uglify({ // put it after compiled & concat
        //     compress: {
        //         drop_console: true
        //     }
        // })))
        // .pipe(pipeByEnv(envs.prod, $.rename(function(path) {
        //     path.basename += ".min";
        //     path.extname = ".js";
        // })))
        .pipe($.sourcemaps.write("."))
        .pipe(gulp.dest(publish_paths.js))
        .pipe(browserSync.stream());
});

gulp.task("scss", function() {
    const plugins = [
        autoprefixer({
            browsers: ["last 1 version", "> 5%", "ie 6-8", "Firefox > 20"]
        })
    ];

    return gulp
        .src(src_paths.scss)
        .pipe($.sourcemaps.init())
        .pipe($.plumber())
        .pipe($.sass().on("error", $.sass.logError)) // compile to css
        .pipe($.postcss(plugins))
        .pipe(pipeByEnv(envs.prod, $.cleanCss())) // put it after compiled
        .pipe(
            pipeByEnv(
                envs.prod,
                $.rename(function(path) {
                    path.basename += ".min";
                    path.extname = ".css";
                })
            )
        )
        .pipe($.sourcemaps.write("."))
        .pipe(gulp.dest(publish_paths.css))
        .pipe(browserSync.stream());
});

// clean tmp_path & published
gulp.task("clean", function() {
    return gulp
        .src([tmp_path, publish_paths.root], {
            read: false
        })
        .pipe($.clean());
});

gulp.task("bower", function() {
    const file = isProd ? ".min.js" : ".js";
    return gulp
        .src(
            mainBowerFiles({
                overrides: {
                    vue: {
                        // 套件名稱
                        main: "../../bower_components/vue/dist/vue" + file // 取用的資料夾路徑
                    },
                    bootstrap: {
                        main: "../../bower_components/bootstrap/dist/js/bootstrap" + file
                    }
                }
            })
        )
        .pipe(gulpDebug())
        .pipe(gulp.dest(tmp_path + "vendors"));
});

gulp.task("vendorsJs", ["bower"], function() {
    return (
        gulp
        .src(tmp_path + "vendors/**/*.js")
        .pipe(
            $.order([
                // dependency order by index
                "jquery.js",
                "bootstrap.js"
            ])
        )
        // .pipe($.concat("vendors.js"))
        .pipe(pipeByEnv(envs.prod, $.uglify())) // put it after concated
        .pipe(
            pipeByEnv(
                envs.prod,
                $.rename(function(path) {
                    path.basename += ".min";
                    path.extname = ".js";
                })
            )
        )
        .pipe(gulpDebug())
        .pipe(gulp.dest(publish_paths.js))
    );
});

// monitoring source changes & autorun the task
gulp.task("watch", function() {
    gulp.watch(src_paths.scss, ["scss"]);
    gulp.watch(src_paths.jade, ["jade"]);
    gulp.watch(src_paths.js, ["babel"]);
});

// Static server
gulp.task("browser-sync", function() {
    browserSync.init({
        server: {
            baseDir: publish_paths.root
        }
    });
});

gulp.task("copy-static", function() {
    // copy src/*.* to publish_paths.root/
    return gulp
        .src(src_paths._static)
        .pipe($.plumber())
        .pipe(gulp.dest(publish_paths.root))
        .pipe(browserSync.stream());
});

gulp.task("jade", function() {
    gulp
        .src(src_paths.jade) // for all sub-dirs & files belong to src
        .pipe($.plumber())
        .pipe(
            $.jade({
                pretty: true // Don't compress
            })
        )
        .pipe(
            pipeByEnv(
                envs.prod,
                $.htmlReplace({
                    css: "css/all.min.css",
                    js: "js/all.min.js"
                }, {
                    resolvePaths: false
                })
            )
        )
        .pipe(gulp.dest(publish_paths.root))
        .pipe(browserSync.stream());
});

/* Help
-------------------------------------------------------------- */
gulp.task("help", function() {
    console.log("---------------------------------------------");
    console.log("gulp (default) >> build for dev");
    console.log("gulp jade >> jade to html");
    console.log("gulp sass >> sass/scss to css");
    console.log("gulp clean >> remove " + tmp_path + " & " + publish_paths.root);
    console.log("---------------------------------------------");
    console.log("With ' --env " + envs.prod + "' to build for production!");
    console.log("---------------------------------------------");
});