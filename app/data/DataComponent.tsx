export async function DataComponent() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = await response.json();
  
  return <span>{JSON.stringify(data)}</span>;
}
