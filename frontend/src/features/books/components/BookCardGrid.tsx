import { BOOK_STATUS_LABELS, type Book } from "@hr-management/shared";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
	STORED: "bg-green-100 text-green-800",
	LENDING: "bg-yellow-100 text-yellow-800",
};

type Props = {
	books: Book[];
	onEdit: (book: Book) => void;
	onDelete: (id: string) => void;
};

export function BookCardGrid({ books, onEdit, onDelete }: Props) {
	const navigate = useNavigate();

	if (books.length === 0) {
		return (
			<div className="py-12 text-center text-gray-500">
				書籍が登録されていません
			</div>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-4">
			{books.map((book) => (
				<button
					key={book.id}
					type="button"
					className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow transition hover:shadow-md"
					onClick={() => navigate(`/books/${book.id}`)}
				>
					<div className="flex h-48 items-center justify-center bg-gray-50">
						{book.coverImageUrl ? (
							<img
								src={book.coverImageUrl}
								alt={book.title}
								className="h-full w-full object-contain"
								onError={(e) => {
									e.currentTarget.style.display = "none";
									e.currentTarget.nextElementSibling?.classList.remove(
										"hidden",
									);
								}}
							/>
						) : null}
						<div
							className={`flex items-center justify-center ${book.coverImageUrl ? "hidden" : ""}`}
						>
							<BookOpen className="h-16 w-16 text-gray-300" />
						</div>
					</div>

					<div className="p-3">
						<h3 className="truncate text-sm font-semibold text-gray-900">
							{book.title}
						</h3>
						<p className="mt-1 truncate text-xs text-gray-500">{book.author}</p>
						<div className="mt-2 flex items-center justify-between">
							<span
								className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[book.status] ?? ""}`}
							>
								{BOOK_STATUS_LABELS[book.status] ?? book.status}
							</span>
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onEdit(book);
									}}
									className="rounded p-1 text-gray-400 hover:text-blue-600"
									title="編集"
								>
									<Pencil className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(book.id);
									}}
									className="rounded p-1 text-gray-400 hover:text-red-600"
									title="削除"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
