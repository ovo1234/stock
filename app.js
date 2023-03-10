const express = require("express");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan"); // 작업 수행시 로깅
const passport = require("passport"); // passport 미들웨어 가져오기
const cookieParser = require("cookie-parser"); // 쿠키 파싱 미들웨어

const dotenv = require("dotenv"); // .env SECRET 정보 가져오기
dotenv.config();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

const { sequelize } = require("./models");
// passportConfig - passport 내부 js 실행 (use, serialize, deserialze)
const passportConfig = require("./passport");
passportConfig(passport);

const app = express();

app.use(express.static(__dirname + "/"));

app.use(express.json());
const cors = require("cors");
app.use(cors());
// 이 코드 넣고 시작하셔야 리액트와 nodejs 서버간 ajax 요청 잘됩니다.

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("port", process.env.PORT || 3000);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// cookieParser 설정에 비밀키를 넣어주자.
// cookieParser를 사용하게되면 req.cookies로 접근이 가능하다.
app.use(cookieParser(process.env.COOKIE_SECRET));

// session 설정
app.use(
  session({
    // 메모리 세션을 활성화하는 코드
    resave: false, // 세션 객체에 수정사항이 없어도 저장할까를 정하는 코드
    saveUninitialized: false, // 처음의 빈 세션 객체라도 저장을 할지말지 정하는 코드
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false, // https를 쓸것인가?
    },
  })
);

// 아래 2개는 session 아래로 적어주자
app.use(passport.initialize()); // passport 초기화 미들웨어
app.use(passport.session()); // 앱에서 영구 로그인을 사용한다면 추가하자

// router

app.use("/", indexRouter);
app.use("/auth", authRouter);

// app.get("/", function (req, res) {
//   res.send("안녕");
// });

const stockprice = require("./route/stockprice");
app.use("/stockprice", stockprice);

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
