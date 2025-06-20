export async function fetchCarDetails(params = {}) {
  let url = "http://localhost:4000/data";
  const query = new URLSearchParams(params).toString();
  if (query) url += `?${query}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}

export async function fetchColumns() {
  const response = await fetch("http://localhost:4000/columns");
  console.log(response);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}

export async function fetchCarDetailById(id) {
  const response = await fetch(`http://localhost:4000/data/${id}`);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}

export async function deleteCarDetailById(id) {
  const response = await fetch(`http://localhost:4000/data/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete");
  return await response.json();
}
