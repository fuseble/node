export type SmartDeliveryCompany = {
  Code: string;
  International: boolean;
  Name: string;
};

export type SmartDeliveryTrackingDetail = {
  code: string; // 배송상태 코드
  kind: string; // 진행상태
  level: number; // 진행단계
  manName: string; // 배송기사 이름
  manPic: string; // 배송기사 전화번호
  remark: string; // 비고
  telno: string; // 진행위치(지점)전화번호
  telno2: string; // 배송기사 전화번호
  time: number; // 진행시간
  timeString: string; // 진행시간
  where: string; // 진행위치지점
};

export type SmartDeliveryTrackingInfo = {
  adUrl: string; // 택배사가 광고용으로 사용하는 URL
  complete: boolean; // 배송 완료 여부
  completeYN: string;
  estimate: string; // 배송 예정 시각
  invoiceNo: string; // 운송장 번호
  itemImage: string; // 제품 이미지
  itemName: string; // 제품 이름
  level: number; // 진행단계 [level 1: 배송준비중, 2: 집화완료, 3: 배송중, 4: 지점 도착, 5: 배송출발, 6:배송 완료]
  orderNumber: string; // 주문 번호
  productInfo: string; // 상품 정보
  receiverAddr: string; // 받는 사람 주소
  receiverName: string; // 받는 사람 성함
  recipient: string; // 수령인 정보
  result: string; // 조회 결과
  senderName: string; // 보내는 사람
  zipCode: string; // 우편 번호
  firstDetail: SmartDeliveryTrackingDetail; // 첫번째 배송 상세 정보
  lastDetail: SmartDeliveryTrackingDetail; // 마지막 배송 상세 정보
  lastStateDetail: SmartDeliveryTrackingDetail; // 마지막 배송 상세 정보
  trackingDetails: SmartDeliveryTrackingDetail[]; // 배송 상세 정보 목록
};
