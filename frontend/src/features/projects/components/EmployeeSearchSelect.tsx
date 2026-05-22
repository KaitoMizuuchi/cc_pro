import type { Employee } from "@hr-management/shared";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchEmployees } from "@/features/employees/hooks/useEmployees";

type SelectedEmployee = {
	id: string;
	lastName: string;
	firstName: string;
};

type SingleProps = {
	mode: "single";
	value: SelectedEmployee | null;
	onChange: (value: SelectedEmployee | null) => void;
	excludeId?: string;
	label: string;
	error?: string;
};

type MultiProps = {
	mode: "multi";
	value: SelectedEmployee[];
	onChange: (value: SelectedEmployee[]) => void;
	excludeId?: string;
	label: string;
	error?: string;
};

type Props = SingleProps | MultiProps;

export function EmployeeSearchSelect(props: Props) {
	const { label, error, excludeId } = props;
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const inputId = useId();

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query), 200);
		return () => clearTimeout(timer);
	}, [query]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const { data, isLoading } = useSearchEmployees(debouncedQuery, excludeId);

	const selectedIds =
		props.mode === "single"
			? props.value
				? [props.value.id]
				: []
			: props.value.map((m) => m.id);

	const candidates = (data?.employees ?? []).filter(
		(e: Employee) => !selectedIds.includes(e.id),
	);

	const handleSelect = (employee: Employee) => {
		const selected: SelectedEmployee = {
			id: employee.id,
			lastName: employee.lastName,
			firstName: employee.firstName,
		};
		if (props.mode === "single") {
			props.onChange(selected);
			setQuery("");
			setOpen(false);
		} else {
			props.onChange([...props.value, selected]);
			setQuery("");
		}
	};

	const handleRemoveSingle = () => {
		if (props.mode === "single") props.onChange(null);
	};

	const handleRemoveMulti = (id: string) => {
		if (props.mode === "multi") {
			props.onChange(props.value.filter((m) => m.id !== id));
		}
	};

	return (
		<div ref={containerRef} className="relative">
			<label
				htmlFor={inputId}
				className="block text-sm font-medium text-gray-700"
			>
				{label}
			</label>

			{props.mode === "single" && props.value && (
				<div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
					<span className="text-sm text-gray-900">
						{props.value.lastName} {props.value.firstName}
					</span>
					<button
						type="button"
						onClick={handleRemoveSingle}
						className="ml-auto text-gray-400 hover:text-gray-600"
						aria-label="リーダー選択解除"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}

			{props.mode === "multi" && props.value.length > 0 && (
				<div className="mt-1 flex flex-wrap gap-2">
					{props.value.map((m) => (
						<span
							key={m.id}
							className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
						>
							{m.lastName} {m.firstName}
							<button
								type="button"
								onClick={() => handleRemoveMulti(m.id)}
								className="text-blue-600 hover:text-blue-800"
								aria-label={`${m.lastName} ${m.firstName} を解除`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
			)}

			{(props.mode === "multi" || !props.value) && (
				<input
					id={inputId}
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder="従業員名を入力して検索"
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			)}

			{open && (props.mode === "multi" || !props.value) && (
				<ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
					{isLoading ? (
						<li className="px-3 py-2 text-sm text-gray-500">読み込み中...</li>
					) : candidates.length === 0 ? (
						<li className="px-3 py-2 text-sm text-gray-500">
							該当する従業員が見つかりません
						</li>
					) : (
						candidates.map((employee: Employee) => (
							<li key={employee.id}>
								<button
									type="button"
									onClick={() => handleSelect(employee)}
									className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-blue-50"
								>
									{employee.lastName} {employee.firstName}{" "}
									<span className="text-gray-500">({employee.email})</span>
								</button>
							</li>
						))
					)}
				</ul>
			)}

			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
}
