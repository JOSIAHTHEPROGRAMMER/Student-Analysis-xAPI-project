export const BASE_URI = "https://student-analytics-app.vercel.app/xapi";

export const STAGES = [
    { id: "Planning", label: "Planning", description: "Define goals, scope, and resources needed before work begins." },
    { id: "Exploration", label: "Exploration", description: "Research and investigate ideas, technologies, and approaches." },
    { id: "Construction", label: "Construction", description: "Build and implement the core components of the project." },
    { id: "Testing", label: "Testing", description: "Verify functionality, identify bugs, and validate requirements." },
    { id: "Reflection", label: "Reflection", description: "Review outcomes, document lessons learned, and assess overall progress." },
];

export const STEPS = {
    comp3609: [
        { id: "Game Concept Design", label: "Game Concept Design", description: "Define the game's genre, mechanics, story, and overall vision." },
        { id: "Mechanics Implementation", label: "Mechanics Implementation", description: "Code and integrate the core gameplay systems and rules." },
        { id: "Asset Integration", label: "Asset Integration", description: "Import and connect art, audio, and other media into the game engine." },
        { id: "Playtesting", label: "Playtesting", description: "Run test sessions to evaluate fun, difficulty, and usability." },
        { id: "Balancing & Refinement", label: "Balancing & Refinement", description: "Tune gameplay values and polish the experience based on feedback." },
    ],
    comp3610: [
        { id: "Problem Framing", label: "Problem Framing", description: "Clearly define the research question, objectives, and success criteria." },
        { id: "Data Acquisition", label: "Data Acquisition", description: "Collect or source the datasets required for analysis." },
        { id: "Data Preparation", label: "Data Preparation", description: "Clean, transform, and structure data for modelling or analysis." },
        { id: "Analysis / Modelling", label: "Analysis / Modelling", description: "Apply statistical or machine learning techniques to derive insights." },
        { id: "Evaluation & Interpretation", label: "Evaluation & Interpretation", description: "Assess model performance and interpret results in context." },
        { id: "Communication of Results", label: "Communication of Results", description: "Present findings clearly through reports, visualisations, or presentations." },
    ],
};

export const COURSES = [
    {
        id: "comp3609",
        name: "COMP 3609 - Game Programming",
        uri: "https://student-analytics-app.vercel.app/xapi/activities/comp3609",
        description: "An introduction to game programming using Java, covering the game loop, 2D graphics, sprites, animation, sound, collision detection, physics, and design patterns. Students build a fully playable 2D platform game as their final project.",
        project: {
            name: "2D Platform Game",
            uri: "https://student-analytics-app.vercel.app/xapi/activities/comp3609/project",
            description:
                "Students design and develop a fully playable 2D platform game in Java using the Java 2D Graphics API. The game must incorporate a game loop, animated sprites, collision detection, user input, sound, parallax backgrounds, tile-based maps, and at least one design pattern. The final deliverable is a complete, runnable game.",
        },
    },
    {
        id: "comp3610",
        name: "COMP 3610 - Big Data Analytics",
        uri: "https://student-analytics-app.vercel.app/xapi/activities/comp3610",
        description: "A project-based course where student groups tackle a real-world data science problem. Students collect and process datasets, apply analysis algorithms, build an application to communicate their findings, and present results in a final report and live demo.",
        project: {
            name: "Data Analytics Application",
            uri: "https://student-analytics-app.vercel.app/xapi/activities/comp3610/project",
            description:
                "Groups of three identify a data science problem, source a real-world dataset, and apply appropriate analysis methods and algorithms. The project progresses through a proposal, two check-ins, a progress report, and culminates in a working application or dashboard, a 15-20 minute live presentation, and a final IEEE-formatted report with code. Overall worth 50% of the course grade.",
        },
    },
];

const VERBS_3609 = [
    { display: "Planned", uri: `${BASE_URI}/verbs/comp3609/planned`, stage: "Planning", description: "The student planned an aspect of the game before writing code, such as level design, class structure, or feature scope." },
    { display: "Attempted", uri: `${BASE_URI}/verbs/comp3609/attempted`, stage: "Exploration", description: "The student made an initial attempt at implementing a game feature or system, even if the result was incomplete." },
    { display: "Revised", uri: `${BASE_URI}/verbs/comp3609/revised`, stage: "Reflection", description: "The student revisited and improved a previously written or designed component of the game." },
    { display: "Tested", uri: `${BASE_URI}/verbs/comp3609/tested`, stage: "Testing", description: "The student ran the game to verify that a specific feature behaved correctly under expected conditions." },
    { display: "Reflected", uri: `${BASE_URI}/verbs/comp3609/reflected`, stage: "Reflection", description: "The student reviewed their own progress, identified what worked and what did not, and recorded lessons learned." },
    { display: "Designed", uri: `${BASE_URI}/verbs/comp3609/designed`, stage: "Planning", description: "The student planned the game structure, screen layout, entity hierarchy, or level architecture before writing code." },
    { display: "Implemented", uri: `${BASE_URI}/verbs/comp3609/implemented`, stage: "Construction", description: "The student wrote code for a game feature or system such as the game loop, input handling, or a game entity." },
    { display: "Animated", uri: `${BASE_URI}/verbs/comp3609/animated`, stage: "Construction", description: "The student set up sprite sheet loading, frame sequencing, or the AnimatedSprite class to bring a character or object to life." },
    { display: "Integrated", uri: `${BASE_URI}/verbs/comp3609/integrated`, stage: "Construction", description: "The student connected separate systems such as wiring sound into gameplay events or linking tile maps to collision detection." },
    { display: "Debugged", uri: `${BASE_URI}/verbs/comp3609/debugged`, stage: "Testing", description: "The student identified and resolved a defect such as a collision detection error, rendering glitch, or incorrect physics behaviour." },
    { display: "Modelled", uri: `${BASE_URI}/verbs/comp3609/modelled`, stage: "Planning", description: "The student created or refined the class structure for game entities, applying OOP principles such as inheritance, interfaces, or encapsulation." },
    { display: "Applied", uri: `${BASE_URI}/verbs/comp3609/applied`, stage: "Construction", description: "The student used a design pattern (Singleton, Composite, Object Pool) or a mathematical concept (projectile motion, Bezier curves) within the project." },
    { display: "Constructed", uri: `${BASE_URI}/verbs/comp3609/constructed`, stage: "Construction", description: "The student built a complete, playable level using the tiled map editor and integrated it into the game with proper map collision detection." },
    { display: "Optimised", uri: `${BASE_URI}/verbs/comp3609/optimised`, stage: "Reflection", description: "The student improved rendering performance, resolved double-buffering or screen-tearing issues, or refactored a system to reduce overhead." },
    { display: "Explored", uri: `${BASE_URI}/verbs/comp3609/explored`, stage: "Exploration", description: "The student investigated an unfamiliar API, tool, or technique relevant to the game without yet committing to an implementation." },
];

const VERBS_3610 = [
    { display: "Planned", uri: `${BASE_URI}/verbs/comp3610/planned`, stage: "Planning", description: "The student planned the analysis approach, dataset strategy, or project structure before beginning implementation." },
    { display: "Attempted", uri: `${BASE_URI}/verbs/comp3610/attempted`, stage: "Exploration", description: "The student made an initial attempt at applying an algorithm, query, or analytical method, even if the result was incomplete." },
    { display: "Revised", uri: `${BASE_URI}/verbs/comp3610/revised`, stage: "Reflection", description: "The student revisited and improved a previously written pipeline, model, or report section based on new findings or feedback." },
    { display: "Tested", uri: `${BASE_URI}/verbs/comp3610/tested`, stage: "Testing", description: "The student tested a pipeline, model, or application component to verify it produced correct and expected results." },
    { display: "Reflected", uri: `${BASE_URI}/verbs/comp3610/reflected`, stage: "Reflection", description: "The student reviewed their own progress, evaluated decisions made during the project, and recorded lessons learned." },
    { display: "Proposed", uri: `${BASE_URI}/verbs/comp3610/proposed`, stage: "Planning", description: "The student contributed to the project proposal, defining the problem, identifying the dataset, and outlining the intended analysis approach." },
    { display: "Collected", uri: `${BASE_URI}/verbs/comp3610/collected`, stage: "Exploration", description: "The student sourced and acquired a real-world dataset from an appropriate data provider, API, or repository for use in the project." },
    { display: "Cleaned", uri: `${BASE_URI}/verbs/comp3610/cleaned`, stage: "Construction", description: "The student preprocessed raw data, handling missing values, correcting inconsistencies, and transforming it into a usable, analysis-ready format." },
    { display: "Analysed", uri: `${BASE_URI}/verbs/comp3610/analysed`, stage: "Construction", description: "The student applied algorithms or statistical methods to the dataset to extract patterns, trends, or insights relevant to the problem statement." },
    { display: "Visualised", uri: `${BASE_URI}/verbs/comp3610/visualised`, stage: "Construction", description: "The student created charts, graphs, or dashboards to clearly communicate findings from the data analysis." },
    { display: "Evaluated", uri: `${BASE_URI}/verbs/comp3610/evaluated`, stage: "Testing", description: "The student assessed model or algorithm performance using appropriate metrics and interpreted the results in context." },
    { display: "Built", uri: `${BASE_URI}/verbs/comp3610/built`, stage: "Construction", description: "The student developed a working application, dashboard, or interactive tool that demonstrates the project analysis." },
    { display: "Documented", uri: `${BASE_URI}/verbs/comp3610/documented`, stage: "Reflection", description: "The student wrote a section of the progress report or final IEEE-formatted report, covering methodology, results, literature review, or reflections." },
    { display: "Reviewed", uri: `${BASE_URI}/verbs/comp3610/reviewed`, stage: "Exploration", description: "The student conducted a literature review, surveying relevant papers and prior work to contextualise the project problem and chosen methods." },
    { display: "Presented", uri: `${BASE_URI}/verbs/comp3610/presented`, stage: "Reflection", description: "The student prepared or delivered part of a check-in update, progress presentation, or the final 15-20 minute project presentation and demo." },
];

export const XAPI_VERBS = {
    comp3609: VERBS_3609,
    comp3610: VERBS_3610,
};