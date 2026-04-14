import { BOOK_STATUS_LABELS } from "@hr-management/shared";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookFormModal } from "@/features/books/components/BookFormModal";
import { useBook } from "@/features/books/hooks/useBooks";

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3">
			<dt className="text-sm font-medium text-gray-500">{label}</dt>
			<dd className="col-span-2 text-sm text-gray-900">{value}</dd>
		</div>
	);
}

const statusColors: Record<string, string> = {
	STORED: "bg-green-100 text-green-800",
	LENDING: "bg-yellow-100 text-yellow-800",
};

export function BookDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: book, isLoading, error } = useBook(id ?? "");
	const [modalOpen, setModalOpen] = useState(false);

	if (isLoading) {
		return <div className="py-12 text-center text-gray-500">読み込み中...</div>;
	}

	if (error || !book) {
		return (
			<div className="py-12 text-center">
				<p className="text-gray-500">書籍が見つかりません</p>
				<Link
					to="/books"
					className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
				>
					一覧に戻る
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<Link
					to="/books"
					className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
				>
					<ArrowLeft className="h-4 w-4" />
					書籍一覧に戻る
				</Link>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
						<span
							className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[book.status] ?? ""}`}
						>
							{BOOK_STATUS_LABELS[book.status] ?? book.status}
						</span>
					</div>
					<button
						type="button"
						onClick={() => setModalOpen(true)}
						className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
					>
						<Pencil className="h-4 w-4" />
						編集
					</button>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-6">
				<div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow">
					{book.coverImageUrl ? (
						<img
							src={book.coverImageUrl}
							alt={book.title}
							className="max-h-72 object-contain"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								e.currentTarget.nextElementSibling?.classList.remove("hidden");
							}}
						/>
					) : null}
					<div
						className={`flex flex-col items-center justify-center text-gray-300 ${book.coverImageUrl ? "hidden" : ""}`}
					>
						<BookOpen className="h-24 w-24" />
						<p className="mt-2 text-sm">表紙なし</p>
					</div>
				</div>

				<div className="col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow">
					<dl>
						<DetailRow label="ISBN" value={book.isbn} />
						<DetailRow label="タイトル" value={book.title} />
						<DetailRow label="著者" value={book.author} />
						<DetailRow label="カテゴリ" value={book.category ?? "—"} />
						<DetailRow label="登録者" value={book.registrant.name} />
						<DetailRow
							label="貸出者"
							value={
								book.borrower
									? `${book.borrower.lastName} ${book.borrower.firstName}`
									: "—"
							}
						/>
						<DetailRow label="備考" value={book.note ?? "—"} />
					</dl>
				</div>
			</div>

			<BookFormModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				book={book}
			/>
		</div>
	);
}
