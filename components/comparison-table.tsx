"use client";

import { Star } from "lucide-react";

interface ComparedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  averageRating: string;
  reviewCount: number;
  specsJSON?: string | null;
}

interface Props {
  a: ComparedProduct;
  b: ComparedProduct;
}

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-8">{value.toFixed(1)}</span>
    </div>
  );
}

function Cell({
  value,
  highlight,
}: {
  value: React.ReactNode;
  highlight?: "win" | "lose" | "tie";
}) {
  const bg =
    highlight === "win"
      ? "bg-green-50 border-l-4 border-green-400"
      : highlight === "lose"
      ? "bg-red-50 border-l-4 border-red-300"
      : "bg-white";
  return <td className={`px-4 py-3 text-sm ${bg}`}>{value}</td>;
}

export function ComparisonTable({ a, b }: Props) {
  const ratingA = parseFloat(a.averageRating);
  const ratingB = parseFloat(b.averageRating);
  const priceA = a.price ?? 0;
  const priceB = b.price ?? 0;
  const reviewsA = a.reviewCount;
  const reviewsB = b.reviewCount;

  const ratingWinner =
    ratingA > ratingB ? "a" : ratingA < ratingB ? "b" : "tie";
  const priceWinner =
    priceA < priceB ? "a" : priceA > priceB ? "b" : "tie"; // lower price wins
  const reviewsWinner =
    reviewsA > reviewsB ? "a" : reviewsA < reviewsB ? "b" : "tie";

  const highlight = (side: "a" | "b", winner: string) => {
    if (winner === "tie") return "tie";
    return winner === side ? "win" : "lose";
  };

  // Try to parse specs
  let specsA: Record<string, string> = {};
  let specsB: Record<string, string> = {};
  try { specsA = a.specsJSON ? JSON.parse(a.specsJSON) : {}; } catch {}
  try { specsB = b.specsJSON ? JSON.parse(b.specsJSON) : {}; } catch {}
  const allSpecKeys = Array.from(new Set([...Object.keys(specsA), ...Object.keys(specsB)]));

  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-36">
              Attribute
            </th>
            <th className="px-4 py-3 font-bold text-base text-gray-900">{a.name}</th>
            <th className="px-4 py-3 font-bold text-base text-gray-900">{b.name}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* Images */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">Image</td>
            <td className="px-4 py-3">
              {a.imageUrl ? (
                <img src={a.imageUrl} alt={a.name} className="w-24 h-24 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No image</div>
              )}
            </td>
            <td className="px-4 py-3">
              {b.imageUrl ? (
                <img src={b.imageUrl} alt={b.name} className="w-24 h-24 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No image</div>
              )}
            </td>
          </tr>

          {/* Price */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">Price</td>
            <Cell
              value={<span className="font-bold text-blue-600">${priceA.toFixed(2)}</span>}
              highlight={highlight("a", priceWinner)}
            />
            <Cell
              value={<span className="font-bold text-blue-600">${priceB.toFixed(2)}</span>}
              highlight={highlight("b", priceWinner)}
            />
          </tr>

          {/* Rating */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">
              <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Rating</span>
            </td>
            <Cell value={<RatingBar value={ratingA} />} highlight={highlight("a", ratingWinner)} />
            <Cell value={<RatingBar value={ratingB} />} highlight={highlight("b", ratingWinner)} />
          </tr>

          {/* Review count */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">Reviews</td>
            <Cell value={`${reviewsA} review${reviewsA !== 1 ? "s" : ""}`} highlight={highlight("a", reviewsWinner)} />
            <Cell value={`${reviewsB} review${reviewsB !== 1 ? "s" : ""}`} highlight={highlight("b", reviewsWinner)} />
          </tr>

          {/* Description */}
          <tr>
            <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">Description</td>
            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{a.description ?? "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{b.description ?? "—"}</td>
          </tr>

          {/* Dynamic specs */}
          {allSpecKeys.map((key) => (
            <tr key={key}>
              <td className="px-4 py-3 text-xs text-gray-400 uppercase font-semibold">{key}</td>
              <td className="px-4 py-3 text-sm">{specsA[key] ?? "—"}</td>
              <td className="px-4 py-3 text-sm">{specsB[key] ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Better value</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" /> Lower value</span>
      </div>
    </div>
  );
}
