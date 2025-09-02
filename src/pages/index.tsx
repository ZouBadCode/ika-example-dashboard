export const meta = {
  title: "Home",
  order: 0,
};

export default function HomePage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-sm text-muted-foreground">
        Welcome to Ika Playground.
      </p>
    </div>
  );
}
