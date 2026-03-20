import { v4 as uuidv4 } from "uuid";
import { BASE_URI } from "./constants";

// Extension URIs 
const EXT_STAGE = `${BASE_URI}/extensions/pedagogical-stage`;
const EXT_STEP  = `${BASE_URI}/extensions/problem-step`;

//  Activity types
export const ACTIVITY_TYPES = {
    project:             `${BASE_URI}/activity-types/project`,
    group:               `${BASE_URI}/activity-types/group`,
    course:              `${BASE_URI}/activity-types/course`,
    // Artifact types — one per project step
    "design-document":   `${BASE_URI}/activity-types/design-document`,
    "code":              `${BASE_URI}/activity-types/code`,
    "asset":             `${BASE_URI}/activity-types/asset`,
    "test-session":      `${BASE_URI}/activity-types/test-session`,
    "refinement":        `${BASE_URI}/activity-types/refinement`,
    "problem-statement": `${BASE_URI}/activity-types/problem-statement`,
    "dataset":           `${BASE_URI}/activity-types/dataset`,
    "data-pipeline":     `${BASE_URI}/activity-types/data-pipeline`,
    "analysis":          `${BASE_URI}/activity-types/analysis`,
    "evaluation":        `${BASE_URI}/activity-types/evaluation`,
    "report":            `${BASE_URI}/activity-types/report`,
    "project-work":      `${BASE_URI}/activity-types/project-work`,
};

// Maps each project step label to an artifact activity-type key.
const STEP_TO_ARTIFACT_TYPE = {
    // COMP 3609 — Game Programming
    "Game Concept Design":      "design-document",
    "Mechanics Implementation": "code",
    "Asset Integration":        "asset",
    "Playtesting":              "test-session",
    "Balancing & Refinement":   "refinement",
    // COMP 3610 — Big Data Analytics
    "Problem Framing":             "problem-statement",
    "Data Acquisition":            "dataset",
    "Data Preparation":            "data-pipeline",
    "Analysis / Modelling":        "analysis",
    "Evaluation & Interpretation": "evaluation",
    "Communication of Results":    "report",
};

// Context activity builders 

/**
 * object — the specific artifact being acted upon this session.
 * URI: <BASE_URI>/projects/<courseCode>/<groupSlug>/<artifactType>/<uuid>
 */
const buildArtifactObject = ({ courseCode, groupSlug, problemStep, artifactName, artifactId, description }) => {
    const code         = courseCode?.toLowerCase().replace(/\s+/g, "-");
    const slug         = groupSlug?.toLowerCase().replace(/\s+/g, "-");
    const artifactType = STEP_TO_ARTIFACT_TYPE[problemStep] ?? "project-work";
    const id           = artifactId ?? uuidv4();

    return {
        objectType: "Activity",
        id: `${BASE_URI}/projects/${code}/${slug}/${artifactType}/${id}`,
        definition: {
            type:        ACTIVITY_TYPES[artifactType],
            name:        { "en-US": artifactName || problemStep || "Project Artifact" },
            description: { "en-US": description  || `${artifactName || problemStep} created during ${courseCode} project work` },
        },
    };
};

/**
 * context.parent — the group's project instance.
 * URI: <BASE_URI>/projects/<courseCode>/<groupSlug>
 */
const buildParentActivity = ({ courseCode, groupSlug, groupName, courseName }) => {
    const code = courseCode?.toLowerCase().replace(/\s+/g, "-");
    const slug = groupSlug?.toLowerCase().replace(/\s+/g, "-");
    return {
        objectType: "Activity",
        id: `${BASE_URI}/projects/${code}/${slug}`,
        definition: {
            name:        { "en-US": `${courseName ?? courseCode} Project - ${groupName}` },
            description: { "en-US": `${courseName ?? courseCode} project instance for ${groupName}` },
        },
    };
};

/**
 * context.grouping — the group itself.
 * URI: <BASE_URI>/groups/<groupSlug>
 */
const buildGroupActivity = ({ groupSlug, groupName, courseCode, courseDescription }) => {
    const slug = groupSlug?.toLowerCase().replace(/\s+/g, "-");
    return {
        objectType: "Activity",
        id: `${BASE_URI}/groups/${slug}`,
        definition: {
            name:        { "en-US": groupName },
            description: { "en-US": courseDescription
                ? `${courseDescription} — ${groupName}`
                : `${courseCode} project group: ${groupName}` },
        },
    };
};

/**
 * context.category — the course.
 * URI: <BASE_URI>/courses/<COURSE-CODE>
 */
const buildCourseActivity = ({ courseCode, courseName, courseDescription }) => {
    const code = courseCode?.toUpperCase().replace(/\s+/g, "-");
    return {
        objectType: "Activity",
        id: `${BASE_URI}/courses/${code}`,
        definition: {
            name:        { "en-US": courseCode },
            description: { "en-US": courseDescription || courseName || courseCode },
        },
    };
};

// Main builder 

/**
 * Builds a complete xAPI statement in the new format.
 *
 * Required fields in `data`:
 *   verbId, verbDisplay        — verb IRI + label (from XAPI_VERBS)
 *   courseCode                 — e.g. "comp3609"
 *   courseName                 — e.g. "COMP 3609 - Game Programming"
 *   courseDescription          — used in category and grouping descriptions
 *   groupId                    — MongoDB _id of the group
 *   groupName                  — display name, e.g. "Group A"
 *   groupSlug                  — URL-safe slug, e.g. "group-a" (from enrollment.group.slug)
 *   problemStep                — drives the artifact type lookup + stored as extension
 *   artifactName               — human label for the object activity
 *   stage                      — pedagogical stage stored as extension
 *
 * Optional:
 *   artifactId                 — stable UUID reused across edits; generated if omitted
 *   description                — artifact description text
 *   result                     — xAPI result block
 *   extensions                 — any extra context extensions to merge in
 *
 * `userData` — Redux auth user (provides actor fallback values).
 */
export const buildStatement = ({ data, userData }) => {
    const homePage = window.location.origin;

    const groupName = data.groupName || "Unknown Group";
    // Use the server-provided slug when available; derive from name as fallback.
    const groupSlug = data.groupSlug || groupName.toLowerCase().replace(/\s+/g, "-");

    // ── Actor ─────────────────────────────────────────────────────────────────
    const actor = {
        objectType: "Agent",
        account: {
            homePage,
            name: data.userId || userData?._id || data.email || "anonymous",
        },
        ...(data.username ? { name: data.username } : {}),
    };

    // ── Verb ──────────────────────────────────────────────────────────────────
    const verb = {
        id:      data.verbId,
        display: { "en-US": data.verbDisplay },
    };

    // ── Object ────────────────────────────────────────────────────────────────
    const object = buildArtifactObject({
        courseCode:   data.courseCode,
        groupSlug,
        problemStep:  data.problemStep,
        artifactName: data.artifactName,
        artifactId:   data.artifactId,
        description:  data.description,
    });

    // ── Context activities ────────────────────────────────────────────────────
    const contextActivities = {
        parent: [buildParentActivity({
            courseCode:  data.courseCode,
            groupSlug,
            groupName,
            courseName:  data.courseName,
        })],
        grouping: [buildGroupActivity({
            groupSlug,
            groupName,
            courseCode:        data.courseCode,
            courseDescription: data.courseDescription,
        })],
        category: [buildCourseActivity({
            courseCode:        data.courseCode,
            courseName:        data.courseName,
            courseDescription: data.courseDescription,
        })],
    };

    // ── Context extensions ────────────────────────────────────────────────────
    const extensions = { ...(data.extensions || {}) };
    if (data.stage)       extensions[EXT_STAGE] = data.stage;
    if (data.problemStep) extensions[EXT_STEP]  = data.problemStep;

    // ── Assemble ──────────────────────────────────────────────────────────────
    const statement = {
        id:      uuidv4(),
        actor,
        verb,
        object,
        context: {
            contextActivities,
            extensions,
        },
        timestamp: new Date().toISOString(),
        version:   "1.0.3",
    };

    if (data.result) statement.result = data.result;

    return statement;
};
