import closetBag from '../assets/figma/closet-bag.svg'
import closetJacket from '../assets/figma/closet-jacket.svg'
import closetPants from '../assets/figma/closet-pants.svg'
import closetShirt from '../assets/figma/closet-shirt.svg'
import closetSneaker from '../assets/figma/closet-sneaker.svg'
import closetSweater from '../assets/figma/closet-sweater.svg'
import closetTee from '../assets/figma/closet-tee.svg'
import heatAccessory from '../assets/figma/heat-accessory.svg'
import heatBag from '../assets/figma/heat-bag.svg'
import heatDress from '../assets/figma/heat-dress.svg'
import heatJacket from '../assets/figma/heat-jacket.svg'
import heatPants from '../assets/figma/heat-pants.svg'
import heatSneaker from '../assets/figma/heat-sneaker.svg'
import heatTee from '../assets/figma/heat-tee.svg'
import homeJacket from '../assets/figma/home-jacket.svg'
import homePants from '../assets/figma/home-pants.svg'
import homeTee from '../assets/figma/home-tee.svg'
import itemBag from '../assets/figma/item-bag.svg'
import itemSweater from '../assets/figma/item-sweater.svg'
import loggedPants from '../assets/figma/logged-pants.svg'
import loggedSneaker from '../assets/figma/logged-sneaker.svg'
import loggedTee from '../assets/figma/logged-tee.svg'
import piecePants from '../assets/figma/piece-pants.svg'
import pieceSneaker from '../assets/figma/piece-sneaker.svg'
import pieceTee from '../assets/figma/piece-tee.svg'
import profileJacket from '../assets/figma/profile-jacket.svg'
import profileSweater from '../assets/figma/profile-sweater.svg'
import sheetSneaker from '../assets/figma/sheet-sneaker.svg'
import welcomeBag from '../assets/figma/welcome-bag.svg'
import welcomeDress from '../assets/figma/welcome-dress.svg'
import welcomeJacket from '../assets/figma/welcome-jacket.svg'
import welcomePants from '../assets/figma/welcome-pants.svg'
import welcomeSneaker from '../assets/figma/welcome-sneaker.svg'
import welcomeTee from '../assets/figma/welcome-tee.svg'
import type { Category } from '../data/types'

// The kinds of garment drawn in the Figma file. Most categories have one
// drawing; tops have three (tee, sweater, shirt).
type Kind = 'tee' | 'sweater' | 'shirt' | 'pants' | 'dress' | 'jacket' | 'sneaker' | 'bag' | 'accessory'

const CATEGORY_KIND: Record<Category, Kind> = {
  Top: 'tee',
  Bottom: 'pants',
  Dress: 'dress',
  Outerwear: 'jacket',
  Shoes: 'sneaker',
  Bag: 'bag',
  Accessory: 'accessory',
}

// Picks the top drawing from words in the piece's name. This is plain text
// matching (no image recognition). Checked in order, so "sweatshirt" is a
// sweater and "t-shirt" is a tee.
function kindFor(category: Category, name = ''): Kind {
  if (category !== 'Top') return CATEGORY_KIND[category]
  if (/\btee\b|t-shirt|tank|cami/i.test(name)) return 'tee'
  if (/sweat|knit|hoodie|crewneck|turtleneck|jumper|cardigan|pullover|fleece/i.test(name)) return 'sweater'
  if (/shirt|blouse|flannel|button/i.test(name)) return 'shirt'
  return 'tee'
}

// Which screen an icon was drawn for. The heat map's 30px icons have a
// slightly heavier stroke than Home's 30px ones.
type Slot = 'heat'

// Figma exports each drawing at several sizes. Each list holds the
// drawings that exist for one kind of garment.
const ICONS: Record<Kind, { src: string; size: number; slot?: Slot }[]> = {
  tee: [
    { src: welcomeTee, size: 52 },
    { src: closetTee, size: 44 },
    { src: pieceTee, size: 34 },
    { src: loggedTee, size: 32 },
    { src: homeTee, size: 30 },
    { src: heatTee, size: 30, slot: 'heat' },
  ],
  sweater: [
    { src: itemSweater, size: 96 },
    { src: closetSweater, size: 44 },
    { src: profileSweater, size: 32 },
  ],
  shirt: [{ src: closetShirt, size: 44 }],
  pants: [
    { src: welcomePants, size: 52 },
    { src: closetPants, size: 44 },
    { src: piecePants, size: 34 },
    { src: loggedPants, size: 32 },
    { src: homePants, size: 30 },
    { src: heatPants, size: 30, slot: 'heat' },
  ],
  dress: [
    { src: welcomeDress, size: 52 },
    { src: heatDress, size: 30, slot: 'heat' },
  ],
  jacket: [
    { src: welcomeJacket, size: 52 },
    { src: closetJacket, size: 44 },
    { src: profileJacket, size: 32 },
    { src: homeJacket, size: 30 },
    { src: heatJacket, size: 30, slot: 'heat' },
  ],
  sneaker: [
    { src: welcomeSneaker, size: 52 },
    { src: closetSneaker, size: 44 },
    { src: sheetSneaker, size: 36 },
    { src: pieceSneaker, size: 34 },
    { src: loggedSneaker, size: 32 },
    { src: heatSneaker, size: 30, slot: 'heat' },
  ],
  bag: [
    { src: welcomeBag, size: 52 },
    { src: closetBag, size: 44 },
    { src: itemBag, size: 32 },
    { src: heatBag, size: 30, slot: 'heat' },
  ],
  // The heat map frame is the only design with an accessory icon (glasses).
  accessory: [{ src: heatAccessory, size: 30, slot: 'heat' }],
}

type Props = {
  category: Category
  size: number
  name?: string // the piece's name, used to tell tees, sweaters and shirts apart
  slot?: Slot
}

// The garment icon for a piece. Uses the drawing made for this screen
// (slot) and size when there is one, otherwise the closest size, scaled.
export default function GarmentIcon({ category, size, name, slot }: Props) {
  const all = ICONS[kindFor(category, name)]
  const forSlot = all.filter((icon) => icon.slot === slot)
  const options = forSlot.length > 0 ? forSlot : all
  const best = options.reduce((a, b) => (Math.abs(b.size - size) < Math.abs(a.size - size) ? b : a))
  return <img src={best.src} width={size} height={size} alt="" />
}
