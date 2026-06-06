import React from 'react';
import type { LoadData } from '../../types';

interface Props {
  load: LoadData;
}

export const DetailRightPanel: React.FC<Props> = ({ load }) => {
  return (
    <div className="detail-right">
      <div className="detail-panel-card">
        <div className="panel-title">Stops</div>
        
        <div className="stop-item">
          <div className="stop-dot blue"></div>
          <div className="stop-info">
            <div className="stop-name">{load.from}</div>
            <div className="stop-time">{load.dateStart} · 08:00</div>
          </div>
        </div>
        
        {load.extraRoute && (
          <div className="stop-item">
            <div className="stop-dot" style={{ width: '12px', height: '12px', border: '2px solid #ccc', borderRadius: '50%', background: 'white' }}></div>
            <div className="stop-info">
              <div className="stop-name">{load.extraRoute.replace('+ ', '')}</div>
              <div className="stop-time">Transit</div>
            </div>
          </div>
        )}
        
        <div className="stop-item">
          <div className="stop-dot green"></div>
          <div className="stop-info">
            <div className="stop-name">{load.to}</div>
            <div className="stop-time">{load.dateEnd || load.dateStart} · 06:00</div>
          </div>
        </div>
      </div>
      
      <div className="detail-panel-card">
        <div className="panel-title">Shipper</div>
        <div className="shipper-card">
          <div className="shipper-avatar">{load.company.substring(0, 2).toUpperCase()}</div>
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
          <input type="text" className="bid-input" defaultValue={load.price.replace('€', '')} />
        </div>
        <div className="bid-suggestion">Suggested: {load.price} based on lane average.</div>
        <button className="bid-submit">Submit bid</button>
      </div>
    </div>
  );
};