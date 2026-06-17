"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Todo } from "@/generated/prisma/client";
import { useDebounceValue } from "usehooks-ts";

function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [subscription, setSubscription] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [debounceSearchTerm] = useDebounceValue(search, 300);

  const fetchTodo = async function () {
    const response = await fetch(
      `/api/todos?page=${page}&search=${debounceSearchTerm}`,
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data.error);
      return;
    }

    setPage(data.currentPage);
    setTodos(data.todos);
    setTotalPage(data.totalPages);
  };

  const createTodo = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return setErrors("Please enter a todo");
    }

    // seding the title to the backend route
    const res = await fetch(`/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: trimmedTitle,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors(data.error);
      return;
    }

    setTitle("")
    fetchTodo()
  };

  useEffect(() => {
    fetchTodo();
  }, [debounceSearchTerm]);

  return <div>Dashboard</div>;
}

export default Dashboard;
