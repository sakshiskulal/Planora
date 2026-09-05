import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import ScheduleView from "@/components/ScheduleView";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative px-3 lg:px-0">
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">What's the plan?</h1>
          <p className="text-muted">Add your tasks below and we'll help you schedule them intelligently.</p>
        </div>

        <TaskForm />

        <div className="mt-8">
          <TaskList />
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0 relative">
        <ScheduleView />
      </div>
    </div>
  );
}
