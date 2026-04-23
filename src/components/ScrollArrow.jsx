import './ScrollArrow.css'

export default function ScrollArrow({ label, targetId, style = {} }) {
  return (
    <a href={`#${targetId}`} className="scroll-arrow" style={style}>
      <span className="scroll-arrow__label">{label}</span>
      <svg
        className="scroll-arrow__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </a>
  )
}
