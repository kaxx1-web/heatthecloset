import { createContext, useContext } from 'react'

// Photos for saved pieces, shared with every screen through React context,
// so GarmentIcon can show a piece's photo without every screen passing
// photos down as props. App fills it in.
//   own:   photos added on the item page, as temporary URLs
//          ({ pieceId: "blob:..." }), loaded from IndexedDB
//   stock: a different stock photo for each piece (see data/garmentPhotos.ts)
export type PiecePhotos = {
  own: Record<string, string>
  stock: Record<string, string>
}

export const PiecePhotosContext = createContext<PiecePhotos>({ own: {}, stock: {} })

// The piece's own photo URL, or undefined if it has none.
export function usePiecePhoto(pieceId: string | undefined): string | undefined {
  const { own } = useContext(PiecePhotosContext)
  return pieceId ? own[pieceId] : undefined
}

// The stock photo picked for a saved piece, or undefined for an unsaved one.
export function useStockPhoto(pieceId: string | undefined): string | undefined {
  const { stock } = useContext(PiecePhotosContext)
  return pieceId ? stock[pieceId] : undefined
}
