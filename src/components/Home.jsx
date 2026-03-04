import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useEnrollment } from "../hooks/useEnrollment";
import { XAPI_VERBS, SCENARIOS } from "../utils/constants";
import api from "../configs/api";

const STAGE_COLOURS = {
  Planning: "bg-blue-500/10   text-blue-300   border-blue-500/20",
  Exploration: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Construction: "bg-amber-500/10  text-amber-300  border-amber-500/20",
  Testing: "bg-green-500/10  text-green-300  border-green-500/20",
  Reflection: "bg-rose-500/10   text-rose-300   border-rose-500/20",
};

//console.log(XAPI_VERBS);

const StageBadge = ({ stage }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium border ${
      STAGE_COLOURS[stage] ?? "bg-white/5 text-[#7b8399] border-white/10"
    }`}
  >
    {stage}
  </span>
);

const Step = ({ number, title, children }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center">
        <span className="text-gold text-xs font-semibold">{number}</span>
      </div>
      {number < 3 && <div className="w-px flex-1 bg-white/6" />}
    </div>
    <div className="pb-8 flex flex-col gap-1.5">
      <p className="text-sm font-medium text-[#e8eaf0]">{title}</p>
      <p className="text-sm text-[#7b8399] leading-relaxed">{children}</p>
    </div>
  </div>
);

const CourseCard = ({ course, enrollment }) => {
  if (!course) return null;

  const courseCode = course?.courseCode ?? "";
  const courseKey = courseCode.toLowerCase();
  const verbs = XAPI_VERBS[courseKey] ?? [];
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!courseCode) return;

    api
      .get(`/api/courses/${courseCode}/groups`)
      .then(({ data }) => setGroups(data.groups ?? []))
      .catch(() => setGroups([]));
  }, [courseCode]);

  const enrolledGroupId = enrollment?.group?._id;
  const enrolledGroup = groups.find((g) => g._id === enrolledGroupId);

  const byStage = verbs.reduce((acc, v) => {
    acc[v.stage] = (acc[v.stage] ?? 0) + 1;
    return acc;
  }, {});

  const displayCode = courseCode ? courseCode.replace("COMP", "COMP ") : "";

  const displayName = course?.name
    ? (course.name.split(" - ")[1] ?? course.name)
    : "";

  return (
    <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[#7b8399]">
            {displayCode}
          </p>
          <p className="text-sm font-medium text-[#e8eaf0] leading-snug">
            {displayName}
          </p>
        </div>
        {enrolledGroup ? (
          <span className="shrink-0 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-gold/10 text-gold border border-gold/20">
            {enrolledGroup.name}
          </span>
        ) : (
          <span className="shrink-0 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white/4 text-[#7b8399] border border-white/6">
            Not enrolled
          </span>
        )}
      </div>

      {/* Project */}
      <div className="px-4 py-3 bg-white/2 border border-white/5 rounded-lg flex flex-col gap-1">
        <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#7b8399]">
          Project
        </p>
        <p className="text-xs text-[#7b8399] leading-relaxed">
          {course?.project?.description ?? ""}
        </p>
      </div>

      {/* Stages */}
      {Object.keys(byStage).length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#7b8399]">
            Stages covered
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(byStage).map(([stage, count]) => (
              <span key={stage} className="flex items-center gap-1">
                <StageBadge stage={stage} />
                <span className="text-[0.6rem] text-[#7b8399]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Verbs */}
      {verbs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#7b8399]">
            Available verbs - {verbs.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {verbs.map((v) => (
              <span
                key={v.uri}
                className="text-[0.65rem] px-2 py-0.5 rounded bg-white/4 border border-white/6 text-[#7b8399]"
              >
                {v.display}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#7b8399]">
            Groups - {groups.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {groups.map((g) => (
              <span
                key={g._id}
                className={`text-[0.65rem] px-2.5 py-0.5 rounded border font-medium ${
                  g._id === enrolledGroupId
                    ? "bg-gold/10 text-gold border-gold/20"
                    : "bg-white/4 text-[#7b8399] border-white/6"
                }`}
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Home = ({ onNavigate }) => {
  const { user } = useSelector((s) => s.auth);
  const { getEnrollment } = useEnrollment();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api
      .get("/api/courses")
      .then(({ data }) => setCourses(data.courses ?? []))
      .catch(() => setCourses([]));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="flex flex-col gap-10"
      style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-gold/70">
          Student Portal
        </p>
        <h1 className="font-display text-3xl text-[#e8eaf0] leading-tight">
          {greeting},{" "}
          <span className="text-gold">{user?.username ?? "student"}</span>.
        </h1>
        <p className="text-sm text-[#7b8399] leading-relaxed max-w-xl mt-1">
          This portal lets you record your learning activity as xAPI statements
          throughout your project. Each statement you submit is stored here and
          forwarded to the Learning Record Store for us to review.
        </p>
      </div>

      <div className="h-px bg-white/6" />

      {/* How it works */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#7b8399]">
            How it works
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            Three steps to log your progress
          </h2>
        </div>
        <div className="max-w-xl">
          <Step number={1} title="Select your course and group">
            Navigate to the Create Statement tab. Choose your course and select
            the group you have been assigned to. Your group selection is saved
            automatically and only needs to be set once per course.
          </Step>
          <Step number={2} title="Choose a verb and learner scenario">
            Each course has a curated list of verbs mapped to project milestones
            - things like Designed, Implemented, Tested, or Visualised. Every
            verb belongs to a stage, and you'll also pick a learner scenario
            that best describes how you're approaching the work.
          </Step>
          <Step number={3} title="Submit your statement">
            Add an optional description for extra context, then submit. Your
            statement is saved immediately and sent to the LRS in the
            background. You can review all submitted statements under the View
            Statements tab.
          </Step>
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* What is xAPI */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#7b8399]">
            Background
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            What is an xAPI statement?
          </h2>
        </div>
        <p className="text-sm text-[#7b8399] leading-relaxed">
          xAPI (Experience API) is a specification for recording learning
          experiences in a standardised format. Every statement follows an{" "}
          <span className="text-[#e8eaf0]">Actor - Verb - Object</span>{" "}
          structure: you (the actor) performed an action (the verb) on something
          (the object - in this case, your project).
        </p>
        <p className="text-sm text-[#7b8399] leading-relaxed">
          Statements are stored locally in this platform's database and
          simultaneously forwarded to a Learning Record Store (LRS), where they
          can be queried, aggregated, and analysed across the entire cohort.
        </p>
        {/* Statement example */}
        <div className="px-5 py-4 bg-white/2 border border-white/8 rounded-xl flex flex-col gap-2">
          <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#7b8399]">
            Example statement
          </p>
          <p className="text-sm text-[#7b8399] leading-relaxed">
            <span className="text-[#e8eaf0] font-medium">Jane Doe</span>{" "}
            <span className="text-gold font-medium">Implemented</span>{" "}
            <span className="text-[#e8eaf0] font-medium">2D Platform Game</span>{" "}
            - Stage:{" "}
            <span
              className={`inline-flex items-center mx-0.5 px-2 py-0.5 rounded text-[0.65rem] font-medium border ${STAGE_COLOURS.Construction}`}
            >
              Construction
            </span>{" "}
            · Scenario: <span className="text-[#e8eaf0]">Tinkerer</span>
          </p>
          <p className="text-xs text-[#7b8399]">
            That single statement gives your us a timestamped, structured record
            of your contribution - far more precise than a weekly update email.
          </p>
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* Stages */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#7b8399]">
            Stages
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            What do the stages mean?
          </h2>
        </div>
        <p className="text-sm text-[#7b8399] leading-relaxed">
          Every verb is tagged with one of five pedagogical stages that describe
          where that activity sits in the project lifecycle. Stages help us
          understand not just <em>what</em> you did, but <em>when</em> in the
          process you did it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              stage: "Planning",
              desc: "Structuring ideas, designing architecture, or scoping work before writing code.",
            },
            {
              stage: "Exploration",
              desc: "Investigating unfamiliar tools, APIs, or techniques - trying things out.",
            },
            {
              stage: "Construction",
              desc: "Actively building, implementing, or integrating features.",
            },
            {
              stage: "Testing",
              desc: "Verifying behaviour, debugging defects, or evaluating results.",
            },
            {
              stage: "Reflection",
              desc: "Reviewing your own progress, documenting findings, or revising earlier work.",
            },
          ].map(({ stage, desc }) => (
            <div
              key={stage}
              className="flex flex-col gap-1.5 px-4 py-3 bg-white/2 border border-white/5 rounded-lg"
            >
              <StageBadge stage={stage} />
              <p className="text-xs text-[#7b8399] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* Learner Scenarios */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#7b8399]">
            Learner Scenarios
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            How are you approaching the work?
          </h2>
        </div>
        <p className="text-sm text-[#7b8399] leading-relaxed">
          Each time you submit a statement you'll select a learner scenario - a
          short description of your working style at that moment. This helps
          build a picture of how different students tackle the same project over
          time.
        </p>
        <div className="flex flex-col gap-3">
          {SCENARIOS.map((s) => (
            <div
              key={s.id}
              className="px-4 py-3 bg-white/2 border border-white/5 rounded-lg flex flex-col gap-1"
            >
              <p className="text-sm font-medium text-[#e8eaf0]">{s.label}</p>
              <p className="text-xs text-[#7b8399] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* Courses */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#7b8399]">
            Your courses
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            Projects, stages and available verbs
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course?._id ?? course?.courseCode}
              course={course}
              enrollment={
                course?.courseCode ? getEnrollment(course.courseCode) : null
              }
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-white/6" />

      {/* CTA */}
      <div className="bg-(--gold-dim) border border-gold/20 rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[#e8eaf0]">
            Ready to log your first statement?
          </p>
          <p className="text-xs text-[#7b8399]">
            Head to Create Statement and record what you worked on today.
          </p>
        </div>
        <button
          onClick={() => onNavigate("create")}
          className="shrink-0 px-5 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] hover:-translate-y-px transition-all duration-200"
        >
          Create Statement
        </button>
      </div>
    </div>
  );
};

export default Home;
