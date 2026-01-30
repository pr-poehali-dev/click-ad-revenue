import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CLICKS_API = 'https://functions.poehali.dev/d10442e8-20a2-40c5-91a1-ca3626e93e7a';
const WITHDRAW_API = 'https://functions.poehali.dev/1d877798-fcfe-4e47-bbc1-ff413dd35dab';

interface Ad {
  ad_id: string;
  title: string;
  description: string;
  reward: number;
  duration_seconds: number;
  category: string;
  target_url: string;
}

interface UserStats {
  balance: number;
  total_earned: number;
  total_clicks: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [userStats, setUserStats] = useState<UserStats>({ balance: 0, total_earned: 0, total_clicks: 0 });
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Сбербанк');
  const [processingAd, setProcessingAd] = useState<string | null>(null);
  const { toast } = useToast();

  const withdrawMethods = [
    { name: 'Yoomoney', icon: 'Wallet' },
    { name: 'QIWI', icon: 'CreditCard' },
    { name: 'Сбербанк', icon: 'Landmark' },
    { name: 'ВТБ', icon: 'Landmark' },
    { name: 'Тинькофф', icon: 'Landmark' },
    { name: 'СБП', icon: 'Smartphone' },
  ];

  useEffect(() => {
    loadAds();
    loadUserStats();
  }, []);

  const loadAds = async () => {
    try {
      const response = await fetch(CLICKS_API);
      const data = await response.json();
      if (data.ads) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error('Ошибка загрузки заданий:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch(`${CLICKS_API}?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleAdClick = async (ad: Ad) => {
    setProcessingAd(ad.ad_id);
    
    toast({
      title: 'Задание начато',
      description: `Откройте ссылку и выполните задание. Награда: ${ad.reward}₽`,
    });

    window.open(ad.target_url, '_blank');

    setTimeout(async () => {
      try {
        const response = await fetch(CLICKS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ad_id: ad.ad_id }),
        });

        const data = await response.json();
        
        if (data.success) {
          setUserStats({
            balance: data.new_balance,
            total_earned: data.total_earned,
            total_clicks: data.total_clicks,
          });

          toast({
            title: '✅ Задание выполнено!',
            description: `Начислено ${data.earned}₽. Баланс: ${data.new_balance.toFixed(2)}₽`,
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось начислить награду',
          variant: 'destructive',
        });
      } finally {
        setProcessingAd(null);
      }
    }, ad.duration_seconds * 1000);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (amount < 100) {
      toast({
        title: 'Ошибка',
        description: 'Минимальная сумма вывода 100₽',
        variant: 'destructive',
      });
      return;
    }

    if (!cardNumber) {
      toast({
        title: 'Ошибка',
        description: 'Введите реквизиты для вывода',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(WITHDRAW_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount,
          method: selectedMethod,
          card_number: cardNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserStats(prev => ({ ...prev, balance: data.new_balance }));
        setWithdrawAmount('');
        setCardNumber('');
        
        toast({
          title: '✅ Вывод выполнен!',
          description: `${amount}₽ отправлено на ${selectedMethod}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить вывод',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить вывод',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Баланс', value: `${userStats.balance.toFixed(2)} ₽`, icon: 'Wallet', color: 'text-primary' },
    { label: 'Всего кликов', value: userStats.total_clicks, icon: 'MousePointerClick', color: 'text-secondary' },
    { label: 'Заработано', value: `${userStats.total_earned.toFixed(2)} ₽`, icon: 'TrendingUp', color: 'text-green-400' },
    { label: 'Заданий', value: ads.length, icon: 'Zap', color: 'text-yellow-400' },
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
              <div className="text-3xl font-bold text-primary">{userStats.balance.toFixed(2)} ₽</div>
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
                <CardDescription>Выполняйте задания и зарабатывайте до 10,000₽</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ads.map((ad) => (
                  <div key={ad.ad_id} className="glass rounded-xl p-4 hover:glow transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ad.title}</h3>
                          <Badge variant="secondary" className="text-xs">{ad.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{ad.description}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {Math.floor(ad.duration_seconds / 60)} мин
                          </span>
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <Icon name="Coins" size={14} />
                            {ad.reward} ₽
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="glow" 
                        onClick={() => handleAdClick(ad)}
                        disabled={processingAd === ad.ad_id}
                      >
                        {processingAd === ad.ad_id ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-1 animate-spin" />
                            Выполняется
                          </>
                        ) : (
                          <>
                            <Icon name="Play" size={16} className="mr-1" />
                            Начать
                          </>
                        )}
                      </Button>
                    </div>
                    <Progress value={processingAd === ad.ad_id ? 50 : 0} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="Megaphone" className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Yandex Ads Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Размещайте свою рекламу и привлекайте целевую аудиторию
                    </p>
                  </div>
                  <Button variant="secondary" className="glow-purple">
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Подробнее
                  </Button>
                </div>
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
                  <h3 className="text-xl font-bold mb-1">ID: {userId.slice(0, 12)}</h3>
                  <Badge variant="secondary" className="mb-4">Активный</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Баланс:</span>
                      <span className="text-primary font-semibold">{userStats.balance.toFixed(2)}₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Кликов:</span>
                      <span className="font-semibold">{userStats.total_clicks}</span>
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
                    { icon: 'Award', label: 'Первый клик', unlocked: userStats.total_clicks > 0 },
                    { icon: 'Target', label: '10 заданий', unlocked: userStats.total_clicks >= 10 },
                    { icon: 'Flame', label: '100₽ заработано', unlocked: userStats.total_earned >= 100 },
                    { icon: 'Star', label: '500₽ заработано', unlocked: userStats.total_earned >= 500 },
                    { icon: 'Rocket', label: '50 кликов', unlocked: userStats.total_clicks >= 50 },
                    { icon: 'Crown', label: '1000₽ заработано', unlocked: userStats.total_earned >= 1000 },
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
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-primary" />
                    Статистика заработка
                  </CardTitle>
                  <CardDescription>Ваши показатели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 glass rounded-xl">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {userStats.total_earned.toFixed(2)} ₽
                      </div>
                      <div className="text-sm text-muted-foreground">Всего заработано</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Выполнено кликов</span>
                        <span className="font-bold">{userStats.total_clicks}</span>
                      </div>
                      <Progress value={(userStats.total_clicks / 100) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm">Текущий баланс</span>
                        <span className="font-bold text-primary">{userStats.balance.toFixed(2)} ₽</span>
                      </div>
                      <Progress value={(userStats.balance / 10000) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" className="text-secondary" />
                    Доступные категории
                  </CardTitle>
                  <CardDescription>Типы заданий</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { cat: 'Просмотры', count: ads.filter(a => a.category === 'Просмотр').length, color: 'bg-primary' },
                      { cat: 'Регистрации', count: ads.filter(a => a.category === 'Регистрация').length, color: 'bg-secondary' },
                      { cat: 'Отзывы', count: ads.filter(a => a.category === 'Отзыв').length, color: 'bg-green-500' },
                      { cat: 'Подписки', count: ads.filter(a => a.category === 'Подписка').length, color: 'bg-yellow-500' },
                    ].map((item) => (
                      <div key={item.cat} className="glass rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">{item.cat}</span>
                          <span className="text-sm text-muted-foreground">{item.count} заданий</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${(item.count / ads.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wallet" className="text-primary" />
                  Автоматический вывод средств
                </CardTitle>
                <CardDescription>
                  Доступно к выводу: <span className="text-primary font-bold">{userStats.balance.toFixed(2)} ₽</span>
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
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
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
                        onClick={() => setSelectedMethod(method.name)}
                        className={`glass rounded-xl p-4 hover:glow transition-all text-center group ${
                          selectedMethod === method.name ? 'glow ring-2 ring-primary' : ''
                        }`}
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
                  <Label htmlFor="account">Реквизиты для вывода (номер карты)</Label>
                  <Input
                    id="account"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="glass"
                  />
                </div>

                <Button 
                  className="w-full glow text-lg py-6" 
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={20} className="mr-2" />
                      Отправить заявку на вывод
                    </>
                  )}
                </Button>

                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="Info" size={16} className="text-primary" />
                    Условия вывода
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Обработка заявок: автоматическая, мгновенно</li>
                    <li>• Комиссия платформы: 0%</li>
                    <li>• Лимит в сутки: 10,000 ₽</li>
                  </ul>
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
