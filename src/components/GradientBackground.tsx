// The moving color background behind every screen. All the styling and
// animation lives in index.css (.gradient-bg). It's decoration only, so
// it's hidden from screen readers and can't be clicked.
export default function GradientBackground() {
  return (
    <div aria-hidden="true" className="gradient-bg">
      <div className="gradient-bg__blob" />
      <div className="gradient-bg__blob" />
      <div className="gradient-bg__blob" />
    </div>
  )
}
