import type { Skill } from "@shared/schemas/skill.schema.js";

type ContentBlock = Skill["content"][number];

interface Props {
  blocks: ContentBlock[];
}

export function LessonContent({ blocks }: Props) {
  return (
    <div className="lesson-content">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3 key={i} className="lesson-heading">
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="lesson-paragraph">
                {block.text}
              </p>
            );
          case "example":
            return (
              <div key={i} className="lesson-example">
                {block.text}
              </div>
            );
          case "rule":
            return (
              <div key={i} className="lesson-rule">
                {block.text}
              </div>
            );
          case "tip":
            return (
              <div key={i} className="lesson-tip">
                <span className="lesson-icon">💡</span>
                <span>{block.text}</span>
              </div>
            );
          case "warning":
            return (
              <div key={i} className="lesson-warning">
                <span className="lesson-icon">⚠️</span>
                <span>{block.text}</span>
              </div>
            );
          case "comparison":
            return (
              <div key={i} className="lesson-example">
                {block.text}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
