import cameraIcon from '../assets/figma/step-camera.svg'
import checkIcon from '../assets/figma/step-check.svg'
import gridIcon from '../assets/figma/step-grid.svg'
import { BackLink, StepDots } from '../components/onboarding'
import { onboardingPrimary } from '../components/ui'
import { routeHref } from '../navigation'

// Figma: "02 How it works"
const STEPS = [
  { icon: cameraIcon, title: 'Snap what you wear', text: 'One outfit photo a day for 30 days.' },
  {
    icon: checkIcon,
    title: 'Check your pieces',
    text: 'We suggest what you’re wearing. You confirm or fix it.',
  },
  {
    icon: gridIcon,
    title: 'See what you’ve forgotten',
    text: 'On day 30, your heat map shows what you didn’t wear.',
  },
]

export default function HowItWorksScreen() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-11 pb-7">
      <BackLink href={routeHref('welcome')} label="Back" />
      <StepDots active={0} />
      <h1 tabIndex={-1} className="text-[30px] leading-[1.15] font-extrabold text-ink">
        How it works
      </h1>

      <ol className="flex flex-col gap-[26px] pt-2.5">
        {STEPS.map(({ icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-peach">
              <img src={icon} width={26} height={26} alt="" />
            </div>
            <div className="flex flex-1 flex-col gap-[3px] leading-[1.4]">
              <h2 className="text-[17px] font-bold text-ink">{title}</h2>
              <p className="text-[15px] text-ink-soft">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex-1" />

      {/* Figma's next frame (03) wasn't provided, so Next goes to the photo step. */}
      <a href={routeHref('photo')} className={onboardingPrimary}>
        Next
      </a>
    </div>
  )
}
