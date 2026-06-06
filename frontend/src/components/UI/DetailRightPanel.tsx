import React, { useState } from 'react';
import type { LoadData } from '../../types';

interface Props {
  load: LoadData;
}

export const DetailRightPanel: React.FC<Props> = ({ load }) => {
  const avatar = load.company ? load.company.substring(0, 2).toUpperCase() : 'CO';
  
  // Инициализируем стейт ставки, очищая символы валюты
  const initialBid = (load.price || '').replace(/[^\d]/g, '');
  const [bidAmount, setBidAmount] = useState<string>(initialBid);

  // Хендлер для ввода только цифр и добавления запятых
  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Убираем всё, кроме цифр
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    if (!rawValue) {
      setBidAmount('');
      return;
    }
    // Добавляем запятые тысячам
    const formattedValue = Number(rawValue).toLocaleString('en-US');
    setBidAmount(formattedValue);
  };

  // Парсим дату и время для красивого вывода в точках маршрута
  const parseDateTime = (dateStr: string, defaultTime: string) => {
    if (dateStr.includes('•')) return dateStr.split('•').map(s => s.trim());
    return [dateStr, defaultTime];
  };

  const [startDate, startTime] = parseDateTime(load.dateStart, '08:00');
  const [endDate, endTime] = parseDateTime(load.dateEnd || load.dateStart, '16:00');

  return (
    <div className="detail-right">
      <div className="detail-panel-card">
        <div className="panel-title">Stops</div>
        
        <div className="stop-item">
          <div className="stop-dot blue"></div>
          <div className="stop-info">
            <div className="stop-date">{startDate} · {startTime}</div>
            <div className="stop-name">{load.from}</div>
          </div>
        </div>
        
        {load.extraRoute && (
          <div className="stop-item">
            <div className="stop-dot transit"></div>
            <div className="stop-info">
              <div className="stop-date">Transit</div>
              <div className="stop-name">{load.extraRoute.replace('+ ', '')}</div>
            </div>
          </div>
        )}
        
        <div className="stop-item">
          <div className="stop-dot green"></div>
          <div className="stop-info">
            <div className="stop-date">{endDate} · {endTime}</div>
            <div className="stop-name">{load.to}</div>
          </div>
        </div>
      </div>
      
      <div className="detail-panel-card">
        <div className="panel-title">Shipper</div>
        <div className="shipper-card">
          <div className="shipper-avatar">{avatar}</div>
          <div className="shipper-info">
            <div className="shipper-name">{load.company}</div>
            <div className="shipper-meta">Verified partner</div>
          </div>
        </div>
        <button className="chat-btn">💬 Open chat</button>
      </div>
      
      <div className="detail-panel-card">
        <div className="panel-title">Place a bid</div>
        <div className="bid-input-wrapper">
          <span className="bid-currency">€</span>
          <input 
            type="text" 
            className="bid-input" 
            value={bidAmount}
            onChange={handleBidChange}
            placeholder="0"
          />
        </div>
        <div className="bid-suggestion">Suggested: {load.price} based on lane average.</div>
        <button className="btn-figma-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>Submit bid</button>
      </div>
    </div>
  );
};