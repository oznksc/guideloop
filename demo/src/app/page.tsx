"use client"
import React, { useState } from "react";
import { Modal, Card, Alert, Typography, Divider, Space } from 'antd';
import { SearchOutlined, InfoCircleOutlined, FilterOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GuideLoop } from '../../../src/components/GuideLoop';
import { Step } from "../../../src/components/GuideLoop/types";

const { Paragraph, Text } = Typography;

export default function Home() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showModal, setShowModal] = useState(false);



  const steps: Step[] = [
    {
      target: '#help-button',
      title: 'Yardım ve Destek',
      content: 'Herhangi bir sorunuz olduğunda yardım merkezine buradan ulaşabilirsiniz.',
      placement: 'bottom',
      showButtons: {
        next: false,
        previous: false
      }
    },
    {
      target: '#search-bar',
      title: 'Hızlı Arama',
      content: 'Tüm içeriklerde arama yapabilirsiniz.',
      placement: 'bottom',
      nextButtonClickElementId: "#show-search-features-modal",
    },
    {
      target: '#alertBox',
      title: 'Bildirimler',
      content: 'Önemli güncellemeleri ve bildirimleri buradan takip edebilirsiniz.',
      placement: 'left',
      showButtons: {
        next: false,
        previous: false
      }
    },
    {
      target: '#sidebar',
      title: 'Ana Menü',
      content: 'Tüm bölümlere buradan hızlıca erişebilirsiniz.',
      placement: 'right',
    }
  ];

  const notifications = [
    { id: 1, title: 'Yeni mesaj', time: '5 dk önce' },
    { id: 2, title: 'Toplantı hatırlatması', time: '1 saat önce' },
    { id: 3, title: 'Görev atandı', time: '2 saat önce' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div id="sidebar" className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <img src="/guideloop-logo.svg" alt="GuideLoop" className="h-8" />
        </div>
        
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-2 bg-gray-900 text-white p-3 rounded-lg">
            <span>Ana Sayfa</span>
          </a>
          <a href="#" className="flex items-center space-x-2 hover:bg-gray-700 p-3 rounded-lg">
            <span>Dökümanlar</span>
          </a>
          <a href="#" className="flex items-center space-x-2 hover:bg-gray-700 p-3 rounded-lg">
            <span>Kullanıcılar</span>
          </a>
          <a href="#" className="flex items-center space-x-2 hover:bg-gray-700 p-3 rounded-lg">
            <span>İstatistikler</span>
          </a>
          <a href="#" className="flex items-center space-x-2 hover:bg-gray-700 p-3 rounded-lg">
            <span>Mesajlar</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center flex-1 space-x-4">
              <div id="search-bar" className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg flex-1 max-w-xl">
                <input
                  type="text"
                  placeholder="Ara..."
                  className="bg-transparent border-none focus:outline-none flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                id="help-button"
                onClick={() => setShowWalkthrough(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                Walkthrough
              </button>

              <div id="notifications" className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg">
              </button>

              <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2">
                <span className="text-sm font-medium">John Doe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-2">Toplam Kullanıcı</div>
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-green-500 text-sm">↑ 12% geçen aya göre</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-2">Aktif Projeler</div>
              <div className="text-2xl font-bold">42</div>
              <div className="text-blue-500 text-sm">8 proje bu ay</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-gray-500 mb-2">Toplam Gelir</div>
              <div className="text-2xl font-bold">₺52,147</div>
              <div className="text-green-500 text-sm">↑ 8% geçen aya göre</div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Son Bildirimler</h2>
            </div>
            <div className="divide-y">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-500">{notification.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Walkthrough Component */}
      <GuideLoop 
          steps={steps}
          isOpen={showWalkthrough}
          onClose={() => setShowWalkthrough(false)}
          theme="tailwind"
          keyboard={true}
          scrollSmooth={true}
          spotlightPadding={8}
        />
      <button
        id="show-search-features-modal"
        className="hidden"
        onClick={() => setShowModal(true)}
      />
       {/* Search Features Modal */}
       {showModal && (
       <Modal
       className="no-motion"
            title={
              <Space>
                <SearchOutlined />
                <span>Gelişmiş Arama Özellikleri</span>
              </Space>
            }
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={[
              <button 
                key="close" 
                onClick={() => setShowModal(false)}
              >
                Anladım
              </button>
            ]}
            width={600}
            maskClosable={false}
            style={{ zIndex: 1000 }}
          >
        <Alert
        id="alertBox"
          message="Daha etkili aramalar yapın"
          description="Arama çubuğunu kullanarak tüm içeriklerde hızlı ve detaylı aramalar yapabilirsiniz."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Card title={
          <Space>
            <FilterOutlined />
            <span>Arama Filtreleri</span>
          </Space>
        }>
          <Typography>
            <Paragraph>
              Aramalarınızı daraltmak için aşağıdaki filtreleri kullanabilirsiniz:
            </Paragraph>
            <ul>
              <li>
                <Text strong>type:</Text> belge tipine göre arama
                <br />
                <Text type="secondary">Örnek: type:pdf, type:doc</Text>
              </li>
              <li>
                <Text strong>date:</Text> tarihe göre arama
                <br />
                <Text type="secondary">Örnek: date:today, date:thisweek</Text>
              </li>
              <li>
                <Text strong>from:</Text> gönderene göre arama
                <br />
                <Text type="secondary">Örnek: from:john@example.com</Text>
              </li>
            </ul>
          </Typography>
        </Card>

        <Divider />

        <Card title={
          <Space>
            <ClockCircleOutlined />
            <span>Hızlı İpuçları</span>
          </Space>
        }>
          <Typography>
            <ul>
              <li>
                <Text strong>Tam Eşleşme:</Text>
                <br />
                <Text type="secondary">Tırnak işaretleri kullanın: "toplantı notları"</Text>
              </li>
              <li>
                <Text strong>VE/VEYA Araması:</Text>
                <br />
                <Text type="secondary">AND/OR operatörleri: rapor AND finans</Text>
              </li>
              <li>
                <Text strong>Hariç Tutma:</Text>
                <br />
                <Text type="secondary">Eksi işareti kullanın: toplantı -pazartesi</Text>
              </li>
            </ul>
          </Typography>
        </Card>

        <Divider />

        <Alert
          message="Kısayol İpucu"
          description={
            <span>
              Arama çubuğuna hızlıca odaklanmak için <Text keyboard>Ctrl</Text> + <Text keyboard>K</Text> kısayolunu kullanabilirsiniz.
            </span>
          }
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </Modal>)}
    </div>

  );
}
