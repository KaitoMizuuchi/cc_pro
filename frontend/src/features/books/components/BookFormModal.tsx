import { zodResolver } from "@hookform/resolvers/zod";
import {
	BOOK_STATUS_LABELS,
	type Book,
	type CreateBookRequest,
	createBookSchema,
} from "@hr-management/shared";
import { Loader2, Search, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { ApiError } from "@/lib/api-client";
import { useCreateBook, useIsbnLookup, useUpdateBook } from "../hooks/useBooks";

type Props = {
	open: boolean;
	onClose: () => void;
	book?: Book;
};

export function BookFormModal({ open, onClose, book }: Props) {
	const isEdit = !!book;
	const { data: empData } = useEmployees(1, 1000);
	const createMutation = useCreateBook();
	const updateMutation = useUpdateBook();
	const isbnLookup = useIsbnLookup();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateBookRequest>({
		resolver: zodResolver(createBookSchema),
	});

	const status = watch("status");
	const isbn = watch("isbn");

	useEffect(() => {
		if (open) {
			reset(
				book
					? {
							isbn: book.isbn,
							title: book.title,
							author: book.author,
							category: book.category ?? undefined,
							coverImageUrl: book.coverImageUrl ?? undefined,
							status: book.status,
							borrowerId: book.borrowerId ?? undefined,
							note: book.note ?? undefined,
						}
					: {
							isbn: "",
							title: "",
							author: "",
							category: undefined,
							coverImageUrl: undefined,
							status: "STORED",
							borrowerId: undefined,
							note: undefined,
						},
			);
		}
	}, [open, book, reset]);

	useEffect(() => {
		if (status !== "LENDING") {
			setValue("borrowerId", undefined);
		}
	}, [status, setValue]);

	if (!open) return null;

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleIsbnLookup = () => {
		if (!isbn) {
			toast.error("ISBNを入力してください");
			return;
		}
		isbnLookup.mutate(isbn, {
			onSuccess: (data) => {
				setValue("title", data.title);
				setValue("author", data.author);
				if (data.category) setValue("category", data.category);
				if (data.coverImageUrl) setValue("coverImageUrl", data.coverImageUrl);
				toast.success("書籍情報を取得しました");
			},
			onError: (error) => {
				if (error instanceof ApiError) {
					toast.error(error.message);
				} else {
					toast.error("ISBN検索に失敗しました");
				}
			},
		});
	};

	const onSubmit = (data: CreateBookRequest) => {
		const onError = (error: Error) => {
			if (error instanceof ApiError) {
				toast.error(error.message);
			} else {
				toast.error("エラーが発生しました。再度お試しください");
			}
		};

		if (isEdit) {
			updateMutation.mutate(
				{ id: book.id, data },
				{
					onSuccess: () => {
						toast.success("書籍情報を更新しました");
						onClose();
					},
					onError,
				},
			);
		} else {
			createMutation.mutate(data, {
				onSuccess: () => {
					toast.success("書籍を登録しました");
					onClose();
				},
				onError,
			});
		}
	};

	return (
		<div
			role="dialog"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={() => {}}
		>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-bold text-gray-900">
						{isEdit ? "書籍編集" : "書籍登録"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label
							htmlFor="isbn"
							className="block text-sm font-medium text-gray-700"
						>
							ISBN
						</label>
						<div className="mt-1 flex gap-2">
							<input
								id="isbn"
								type="text"
								{...register("isbn")}
								className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							<button
								type="button"
								onClick={handleIsbnLookup}
								disabled={isbnLookup.isPending}
								className="flex shrink-0 items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isbnLookup.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Search className="h-4 w-4" />
								)}
								ISBN検索
							</button>
						</div>
						{errors.isbn && (
							<p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
						)}
					</div>

					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700"
						>
							タイトル
						</label>
						<input
							id="title"
							type="text"
							{...register("title")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.title && (
							<p className="mt-1 text-sm text-red-600">
								{errors.title.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="author"
							className="block text-sm font-medium text-gray-700"
						>
							著者
						</label>
						<input
							id="author"
							type="text"
							{...register("author")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
						{errors.author && (
							<p className="mt-1 text-sm text-red-600">
								{errors.author.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-700"
						>
							カテゴリ
						</label>
						<input
							id="category"
							type="text"
							{...register("category")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<input type="hidden" {...register("coverImageUrl")} />

					<div>
						<label
							htmlFor="status"
							className="block text-sm font-medium text-gray-700"
						>
							ステータス
						</label>
						<select
							id="status"
							{...register("status")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						>
							{Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>

					{status === "LENDING" && (
						<div>
							<label
								htmlFor="borrowerId"
								className="block text-sm font-medium text-gray-700"
							>
								貸出者
							</label>
							<select
								id="borrowerId"
								{...register("borrowerId")}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							>
								<option value="">選択してください</option>
								{empData?.employees.map((emp) => (
									<option key={emp.id} value={emp.id}>
										{emp.lastName} {emp.firstName}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<label
							htmlFor="note"
							className="block text-sm font-medium text-gray-700"
						>
							備考
						</label>
						<textarea
							id="note"
							rows={3}
							{...register("note")}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						>
							キャンセル
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isPending ? "処理中..." : isEdit ? "更新" : "登録"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
