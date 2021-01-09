const express = require("express");
const router = express.Router();
const { routeRequiresSignedIn, getCurrentUserId } = require("./auth-setup");

const { UserAnswers } = require("./orm");

const ANSWER_HISTORY_LIMIT = 3;

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/cheatsheet", (req, res) => {
  res.render("cheatsheet");
});

// All user-related API routes need a signed in user
router.use("/user", routeRequiresSignedIn);

router.get("/user/progress", (_, res, next) => {
  UserAnswers.findOne({
    where: {
      user_id: getCurrentUserId(res),
    },
    order: [["created_at", "DESC"]],
  })
    .then((answer) => {
      const currentQuestionNumber = answer ? answer.question_number + 1 : 1;
      res.send({ currentQuestionNumber });
    })
    .catch(next);
});

router.post("/user/answers/question/:questionNumber", (req, res, next) => {
  if (req.body.id) {
    return res.status(400).json({ message: "ID should not be provided" });
  }
  UserAnswers.create({
    user_id: getCurrentUserId(res),
    question_number: req.params.questionNumber,
    is_correct: req.body.isCorrect,
    elapsed_time_ms: req.body.elapsedTimeMs,
  })
    .then((userAnswer) => {
      res.status(201).json(userAnswer);
    })
    .catch(next);
});
router.get("/user/answers/question/:questionNumber", (req, res) => {
  UserAnswers.findAll({
    where: {
      question_number: req.params.questionNumber,
      user_id: getCurrentUserId(res),
    },
    order: [["created_at", "DESC"]],
    limit: ANSWER_HISTORY_LIMIT,
  })
    .then((userAnswers) => {
      return res.json({
        previousTimingMs: userAnswers.map(
          (userAnswer) => userAnswer.elapsed_time_ms
        ),
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json(error.errors); // TODO: handle better error messages
    });
});

module.exports = router;
