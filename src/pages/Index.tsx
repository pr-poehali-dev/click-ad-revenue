import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [balance] = useState(1247.50);
  const [todayEarnings] = useState(89.30);
  const [totalClicks] = useState(1523);

  const tasks = [
    { id: 1, title: 'Посетить сайт компании', reward: 2.50, time: '30 сек', category: 'Просмотр' },
    { id: 2, title: 'Зарегистрироваться на платформе', reward: 15.00, time: '5 мин', category: 'Регистрация' },
    { id: 3, title: 'Оставить отзыв', reward: 8.00, time: '3 мин', category: 'Отзыв' },
    { id: 4, title: 'Посмотреть видео до конца', reward: 5.00, time: '2 мин', category: 'Видео' },
    { id: 5, title: 'Подписаться на канал', reward: 3.50, time: '1 мин', category: 'Подписка' },
  ];

  const stats = [
    { label: 'Сегодня', value: `${todayEarnings.toFixed(2)} ₽`, icon: 'TrendingUp', color: 'text-primary' },
    { label: 'Всего кликов', value: totalClicks, icon: 'MousePointerClick', color: 'text-secondary' },
    { label: 'Выполнено', value: '47 заданий', icon: 'CheckCircle2', color: 'text-green-400' },
    { label: 'Рейтинг', value: '#234', icon: 'Trophy', color: 'text-yellow-400' },
  ];

  const withdrawMethods = [
    { name: 'Yoomoney', icon: 'Wallet', available: true },
    { name: 'QIWI', icon: 'CreditCard', available: true },
    { name: 'Сбербанк', icon: 'Landmark', available: true },
    { name: 'ВТБ', icon: 'Landmark', available: true },
    { name: 'Тинькофф', icon: 'Landmark', available: true },
    { name: 'СБП', icon: 'Smartphone', available: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="mb-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                CLICKWAVE
              </h1>
              <p className="text-muted-foreground">Заработок нового поколения</p>
            </div>
            <div className="glass rounded-2xl px-6 py-4 glow">
              <div className="text-sm text-muted-foreground mb-1">Баланс</div>
              <div className="text-3xl font-bold text-primary">{balance.toFixed(2)} ₽</div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass w-full justify-start p-1 h-auto">
            <TabsTrigger value="home" className="gap-2">
              <Icon name="Home" size={18} />
              Главная
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={18} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Icon name="BarChart3" size={18} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="gap-2">
              <Icon name="Wallet" size={18} />
              Вывод средств
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx} className="glass glow-purple border-border/50 hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon name={stat.icon} className={stat.color} size={24} />
                      <Badge variant="outline" className="text-xs">{stat.label}</Badge>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" className="text-primary" />
                  Доступные задания
                </CardTitle>
                <CardDescription>Выполняйте задания и зарабатывайте</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="glass rounded-xl p-4 hover:glow transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {task.time}
                          </span>
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <Icon name="Coins" size={14} />
                            {task.reward} ₽
                          </span>
                        </div>
                      </div>
                      <Button className="glow">
                        <Icon name="Play" size={16} className="mr-1" />
                        Начать
                      </Button>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass border-border/50 lg:col-span-1">
                <CardContent className="pt-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center glow">
                    <Icon name="User" size={48} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Пользователь #7834</h3>
                  <Badge variant="secondary" className="mb-4">Продвинутый</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Регистрация:</span>
                      <span>15.01.2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Уровень:</span>
                      <span className="text-primary font-semibold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Достижения</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: 'Award', label: 'Первые 100', unlocked: true },
                    { icon: 'Target', label: 'Снайпер', unlocked: true },
                    { icon: 'Flame', label: 'Неделя подряд', unlocked: true },
                    { icon: 'Star', label: 'Топ-500', unlocked: false },
                    { icon: 'Rocket', label: 'Скорость света', unlocked: false },
                    { icon: 'Crown', label: 'Легенда', unlocked: false },
                  ].map((achievement, idx) => (
                    <div
                      key={idx}
                      className={`glass rounded-xl p-4 text-center ${
                        achievement.unlocked ? 'glow-purple' : 'opacity-40'
                      }`}
                    >
                      <Icon
                        name={achievement.icon}
                        size={32}
                        className={achievement.unlocked ? 'text-secondary mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'}
                      />
                      <div className="text-xs font-semibold">{achievement.label}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>История операций</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'earn', desc: 'Выполнено задание', amount: '+15.00', time: '10:34' },
                    { type: 'earn', desc: 'Выполнено задание', amount: '+8.00', time: '09:12' },
                    { type: 'withdraw', desc: 'Вывод на Yoomoney', amount: '-500.00', time: 'Вчера' },
                    { type: 'earn', desc: 'Выполнено задание', amount: '+2.50', time: 'Вчера' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'earn' ? 'bg-primary/20' : 'bg-secondary/20'
                          }`}
                        >
                          <Icon
                            name={item.type === 'earn' ? 'ArrowDownLeft' : 'ArrowUpRight'}
                            className={item.type === 'earn' ? 'text-primary' : 'text-secondary'}
                            size={20}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.desc}</div>
                          <div className="text-xs text-muted-foreground">{item.time}</div>
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          item.type === 'earn' ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        {item.amount} ₽
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-primary" />
                    График заработка
                  </CardTitle>
                  <CardDescription>За последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => {
                      const values = [45, 67, 89, 54, 78, 92, 89];
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-8 text-sm text-muted-foreground">{day}</div>
                          <Progress value={values[idx]} className="flex-1" />
                          <div className="w-16 text-sm font-semibold text-right">{values[idx]} ₽</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" className="text-secondary" />
                    Категории заданий
                  </CardTitle>
                  <CardDescription>Распределение по типам</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { cat: 'Просмотры', percent: 35, color: 'bg-primary' },
                      { cat: 'Регистрации', percent: 28, color: 'bg-secondary' },
                      { cat: 'Отзывы', percent: 20, color: 'bg-green-500' },
                      { cat: 'Подписки', percent: 17, color: 'bg-yellow-500' },
                    ].map((item) => (
                      <div key={item.cat}>
                        <div className="flex justify-between mb-2 text-sm">
                          <span>{item.cat}</span>
                          <span className="font-semibold">{item.percent}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Всего заработано', value: '12,847 ₽', icon: 'Wallet' },
                    { label: 'Выведено', value: '8,500 ₽', icon: 'ArrowUpRight' },
                    { label: 'Активных дней', value: '23', icon: 'Calendar' },
                    { label: 'Средний доход', value: '78 ₽/день', icon: 'Activity' },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <Icon name={stat.icon} className="text-primary mx-auto mb-2" size={32} />
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wallet" className="text-primary" />
                  Вывод средств
                </CardTitle>
                <CardDescription>
                  Доступно к выводу: <span className="text-primary font-bold">{balance.toFixed(2)} ₽</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="mb-2 block">Сумма вывода</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="glass text-lg pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Минимальная сумма вывода: 100 ₽
                  </p>
                </div>

                <div>
                  <Label className="mb-3 block">Выберите способ вывода</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {withdrawMethods.map((method) => (
                      <button
                        key={method.name}
                        className="glass rounded-xl p-4 hover:glow transition-all text-center group"
                      >
                        <Icon
                          name={method.icon}
                          size={32}
                          className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform"
                        />
                        <div className="font-semibold text-sm">{method.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="account">Реквизиты для вывода</Label>
                  <Input
                    id="account"
                    placeholder="Номер карты / кошелька / телефона"
                    className="glass"
                  />
                </div>

                <Button className="w-full glow text-lg py-6">
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить заявку на вывод
                </Button>

                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="Info" size={16} className="text-primary" />
                    Условия вывода
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Обработка заявок: автоматическая, до 5 минут</li>
                    <li>• Комиссия платформы: 0%</li>
                    <li>• Лимит в сутки: 10,000 ₽</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>История выводов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { method: 'Yoomoney', amount: 500, status: 'Выполнено', date: '28.01.2026', time: '14:23' },
                    { method: 'СБП', amount: 1200, status: 'Выполнено', date: '25.01.2026', time: '09:15' },
                    { method: 'Сбербанк', amount: 800, status: 'Выполнено', date: '22.01.2026', time: '16:45' },
                  ].map((item, idx) => (
                    <div key={idx} className="glass rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="CheckCircle2" className="text-primary" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.method}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.date} в {item.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.amount} ₽</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
