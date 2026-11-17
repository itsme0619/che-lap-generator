// NEW FILE
// The top of each printed page: game name, lesson, and a blank name line.
// Shows only on paper (the "print-only" class hides it on screen).

function PrintHeader({ title, subtitle }) {
  return (
    <div className="print-header print-only">
      <div>
        <strong>{title}</strong>
        {subtitle && <span className="print-subtitle"> · {subtitle}</span>}
      </div>
      <div className="name-line">Name: ______________________</div>
    </div>
  )
}

export default PrintHeader
