import { stockPhotoFor } from '../data/garmentPhotos'
import type { Category } from '../data/types'
import { usePiecePhoto, useStockPhoto } from './piecePhotos'

type Props = {
  category: Category
  size: number
  name?: string // the piece's name, used to pick a matching stock photo
  pieceId?: string // a saved piece: use its own photo, or the stock photo it was given
}

// The picture for a piece, in this order:
// 1. its own photo, added on its item page
// 2. the stock photo it was given (each saved piece gets a different one)
// 3. the best stock photo for its category and name (unsaved pieces, and
//    whole categories on the heat map)
// Photos are square, so object-cover never crops much. The colored tile
// around the picture stays visible as a frame, so the heat color still
// shows. alt="": the piece's name is always shown next to it.
export default function GarmentIcon({ category, size, name, pieceId }: Props) {
  const own = usePiecePhoto(pieceId)
  const stock = useStockPhoto(pieceId)
  const src = own ?? stock ?? stockPhotoFor(category, name)
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      decoding="async"
      className="aspect-square rounded-lg object-cover"
    />
  )
}
