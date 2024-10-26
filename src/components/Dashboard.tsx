import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  createdAt: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  tags: string[];
  category: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTask, setNewTask] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedView, setSelectedView] = useState('month');

  // 格式化日期
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // 格式化中文日期
  const formatDateChinese = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 生成当月日历数据
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const formattedDate = formatDate(date);
      const dayTasks = tasks.filter(task => task.date === formattedDate);
      const dayNotes = notes.filter(note => note.date === formattedDate);
      
      days.push({
        date: new Date(date),
        formattedDate,
        tasks: dayTasks,
        notes: dayNotes,
        totalTasks: dayTasks.length,
        completedTasks: dayTasks.filter(task => task.completed).length
      });
    }
    return days;
  };

  // 月份导航
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + direction));
    setCurrentDate(new Date(newDate));
  };

  // 添加任务
  const addTask = () => {
    if (newTask.trim()) {
      const newTaskItem = {
        id: Date.now(),
        title: newTask,
        completed: false,
        date: formatDate(currentDate),
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
    }
  };

  // 添加笔记
  const addNote = () => {
    if (noteTitle.trim() && noteContent.trim()) {
      const newNoteItem = {
        id: Date.now(),
        title: noteTitle,
        content: noteContent,
        date: formatDate(currentDate),
        createdAt: new Date().toISOString(),
        tags: [],
        category: 'general'
      };
      setNotes([...notes, newNoteItem]);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  // 切换任务状态
  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // 查看笔记
  const viewNote = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  // 更新笔记
  const updateNote = () => {
    if (selectedNote && noteTitle.trim() && noteContent.trim()) {
      setNotes(notes.map(note =>
        note.id === selectedNote.id
          ? { ...note, title: noteTitle, content: noteContent, updatedAt: new Date().toISOString() }
          : note
      ));
      setSelectedNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  // 准备统计数据
  const prepareStatsData = () => {
    const calendarDays = generateCalendarDays();
    
    const dailyStats = calendarDays.map(day => ({
      date: formatDateChinese(day.date),
      totalTasks: day.totalTasks,
      completedTasks: day.completedTasks,
      notes: day.notes.length
    }));

    const summaryStats = [
      {
        name: '已完成任务',
        value: tasks.filter(task => task.completed).length
      },
      {
        name: '待完成任务',
        value: tasks.filter(task => !task.completed).length
      },
      {
        name: '本月笔记',
        value: notes.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate.getMonth() === currentDate.getMonth() &&
                 noteDate.getFullYear() === currentDate.getFullYear();
        }).length
      }
    ];

    return { dailyStats, summaryStats };
  };

  // 月历视图
  const renderCalendar = () => {
    const calendarDays = generateCalendarDays();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center font-medium p-2">{day}</div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={day.formattedDate}
            className="border rounded p-2 min-h-[100px] cursor-pointer hover:bg-slate-50"
            onClick={() => setCurrentDate(day.date)}
          >
            <div className="text-right text-sm text-gray-500">
              {day.date.getDate()}
            </div>
            <div className="text-xs">
              <div className="text-green-600">
                任务: {day.completedTasks}/{day.totalTasks}
              </div>
              <div className="text-blue-600">
                笔记: {day.notes.length}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const { dailyStats, summaryStats } = prepareStatsData();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">日历</TabsTrigger>
          <TabsTrigger value="tasks">任务</TabsTrigger>
          <TabsTrigger value="notes">笔记</TabsTrigger>
          <TabsTrigger value="stats">统计</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderCalendar()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>任务管理 - {formatDateChinese(currentDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="添加新任务..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button onClick={addTask}>添加</Button>
              </div>
              <ScrollArea className="h-[500px]">
                {tasks
                  .filter(task => task.date === formatDate(currentDate))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTask(task.id)}
                      >
                        <Check className={task.completed ? 'text-green-500' : 'text-gray-300'} />
                      </Button>
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                  ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>笔记管理 - {formatDateChinese(currentDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="笔记标题"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="mb-2"
                  />
                  <Textarea
                    placeholder="笔记内容..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="mb-2 h-[400px]"
                  />
                  <Button onClick={selectedNote ? updateNote : addNote}>
                    {selectedNote ? '更新' : '添加'}
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  {notes
                    .filter(note => note.date === formatDate(currentDate))
                    .map((note) => (
                      <div
                        key={note.id}
                        className="p-2 hover:bg-slate-100 rounded cursor-pointer"
                        onClick={() => viewNote(note)}
                      >
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-sm text-gray-700 truncate">{note.content}</p>
                      </div>
                    ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>月度统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completedTasks" stroke="#82ca9d" name="已完成任务" />
                      <Line type="monotone" dataKey="totalTasks" stroke="#8884d8" name="总任务" />
                      <Line type="monotone" dataKey="notes" stroke="#ffc658" name="笔记数量" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
