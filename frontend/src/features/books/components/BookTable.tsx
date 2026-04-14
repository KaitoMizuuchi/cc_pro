import { BOOK_STATUS_LABELS, type Book } from "@hr-management/shared";
import { Pencil, Trash2 } from "lucide-react";
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

export function BookTable({ books, onEdit, onDelete }: Props) {
	const navigate = useNavigate();

	if (books.length === 0) {
		return (
			<div className="py-12 text-center text-gray-500">
				書籍が登録されていません
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							タイトル
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							著者
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							ISBN
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							ステータス
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							登録者
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							貸出者
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
							操作
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 bg-white">
					{books.map((book) => (
						<tr
							key={book.id}
							className="cursor-pointer hover:bg-gray-50"
							onClick={() => navigate(`/books/${book.id}`)}
						>
							<td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
								{book.title}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{book.author}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{book.isbn}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm">
								<span
									className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[book.status] ?? ""}`}
								>
									{BOOK_STATUS_LABELS[book.status] ?? book.status}
								</span>
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{book.registrant.name}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
								{book.borrower
									? `${book.borrower.lastName} ${book.borrower.firstName}`
									: "—"}
							</td>
							<td className="whitespace-nowrap px-4 py-3 text-sm">
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onEdit(book);
										}}
										className="text-gray-400 hover:text-blue-600"
										title="編集"
									>
										<Pencil className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(book.id);
										}}
										className="text-gray-400 hover:text-red-600"
										title="削除"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
