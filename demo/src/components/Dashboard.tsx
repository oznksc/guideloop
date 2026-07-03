"use client";
import React, { useState } from "react";
import { Modal, Alert, Card, Typography, Space, Divider } from "antd";
import {
  SearchOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Paragraph, Text } = Typography;

interface DashboardProps {
  onStartTour: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartTour }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({ name: "", email: "", role: "user", agree: false });

  const notifications = [
    { id: 1, title: "Yeni mesaj alındı", time: "5 dk önce", type: "info" },
    { id: 2, title: "Toplantı hatırlatması", time: "1 saat önce", type: "warning" },
    { id: 3, title: "Görev atandı", time: "2 saat önce", type: "success" },
    { id: 4, title: "Sistem güncellemesi", time: "3 saat önce", type: "info" },
    { id: 5, title: "Yeni yorum", time: "5 saat önce", type: "success" },
  ];

  const tableData = [
    { id: 1, name: "Proje Alpha", status: "Aktif", progress: 78, owner: "Ali" },
    { id: 2, name: "Proje Beta", status: "Beklemede", progress: 45, owner: "Ayşe" },
    { id: 3, name: "Proje Gamma", status: "Tamamlandı", progress: 100, owner: "Mehmet" },
    { id: 4, name: "Proje Delta", status: "Aktif", progress: 62, owner: "Zeynep" },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center flex-1 space-x-4">
            <div
              id="search-bar"
              className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg flex-1 max-w-xl"
            >
              <SearchOutlined className="text-gray-400" />
              <input
                type="text"
                placeholder="Ara... (Ctrl+K)"
                className="bg-transparent border-none focus:outline-none flex-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="help-button"
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Walkthrough
            </button>

            <button id="notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <BellOutlined className="text-lg" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                5
              </span>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <SettingOutlined className="text-lg" />
            </button>

            <div id="user-profile" className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8">
        {/* Tabs */}
        <div id="tab-section" className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          {[
            { id: "overview", label: "Genel Bakış", icon: <BarChartOutlined /> },
            { id: "projects", label: "Projeler", icon: <FileTextOutlined /> },
            { id: "team", label: "Ekip", icon: <TeamOutlined /> },
            { id: "messages", label: "Mesajlar", icon: <MessageOutlined /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div id="stats-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-500 text-sm">Toplam Kullanıcı</div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TeamOutlined className="text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-green-500 text-xs mt-1">↑ 12% geçen aya göre</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-500 text-sm">Aktif Projeler</div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileTextOutlined className="text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-blue-500 text-xs mt-1">8 proje bu ay</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-500 text-sm">Toplam Gelir</div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">₺52,147</div>
            <div className="text-green-500 text-xs mt-1">↑ 8% geçen aya göre</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-500 text-sm">Bekleyen Görev</div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <ClockCircleOutlined className="text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">17</div>
            <div className="text-red-500 text-xs mt-1">3 acil görev</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart placeholder */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Haftalık Aktivite</h3>
            <div className="flex items-end space-x-2 h-40">
              {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Son Bildirimler</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{n.title}</div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        n.type === "info" ? "bg-blue-400" : n.type === "warning" ? "bg-yellow-400" : "bg-green-400"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div id="table-section" className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Projeler</h3>
            <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">Tümünü Gör →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Proje</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">İlerleme</th>
                <th className="px-4 py-3 font-medium">Sorumlu</th>
                <th className="px-4 py-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-700">{row.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        row.status === "Aktif"
                          ? "bg-green-50 text-green-600"
                          : row.status === "Beklemede"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.progress === 100 ? "bg-green-500" : row.progress > 50 ? "bg-blue-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.owner}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Section */}
        <div id="form-section" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Hızlı Form</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">İsim</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Adınızı girin"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">E-posta</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-posta adresiniz"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
                <option value="editor">Editör</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agree}
                  onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-600">Koşulları kabul ediyorum</span>
              </label>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
            Kaydet
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          GuideLoop Demo — React Guided Tour Library
        </div>
      </div>

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
            <button key="close" onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
              Anladım
            </button>,
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

          <Card
            title={
              <Space>
                <FilterOutlined />
                <span>Arama Filtreleri</span>
              </Space>
            }
          >
            <Typography>
              <Paragraph>
                Aramalarınızı daraltmak için aşağıdaki filtreleri kullanabilirsiniz:
              </Paragraph>
              <ul className="space-y-2">
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

          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Hızlı İpuçları</span>
              </Space>
            }
          >
            <Typography>
              <ul className="space-y-2">
                <li>
                  <Text strong>Tam Eşleşme:</Text>
                  <br />
                  <Text type="secondary">Tırnak işaretleri kullanın: &quot;toplantı notları&quot;</Text>
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
                Arama çubuğuna hızlıca odaklanmak için <Text keyboard>Ctrl</Text> + <Text keyboard>K</Text> kısayolunu
                kullanabilirsiniz.
              </span>
            }
            type="success"
            showIcon
          />
        </Modal>
      )}

      {/* Hidden trigger button for modal */}
      <button id="show-search-features-modal" className="hidden" onClick={() => setShowModal(true)} />
    </div>
  );
};
