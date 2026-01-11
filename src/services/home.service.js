const API_URL = "http://localhost:5000/api/home";

export const getHomeData = async () => {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Không thể tải dữ liệu Home");
  }

  return res.json();
};

//Tách logic gọi API ra khỏi component 
// giúp dễ test, dễ bảo trì, và tái sử dụng.