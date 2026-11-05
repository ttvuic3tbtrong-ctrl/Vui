
/* CO GIAO AI - Phan loai 14 nhom tinh huong
   Ban thu nghiem 1.0
   Khong luu noi dung tam su cua hoc sinh.
*/
(function (root) {
  "use strict";

  const NHOM = [
    {
      id: "xuc_pham",
      ten: "Chế giễu, xúc phạm",
      cum: [
        "bị chửi", "bạn chửi em", "bị chế giễu",
        "bị miệt thị", "chê ngoại hình",
        "gọi biệt danh xúc phạm", "body shaming",
        "bị sỉ nhục", "bị xúc phạm"
      ]
    },
    {
      id: "bat_nat_lap_lai",
      ten: "Bắt nạt lặp lại",
      cum: [
        "bị bắt nạt nhiều lần",
        "bị trêu chọc nhiều lần",
        "ngày nào cũng trêu",
        "liên tục bắt nạt",
        "đã bảo dừng nhưng vẫn tiếp tục",
        "bị bắt nạt suốt"
      ]
    },
    {
      id: "co_lap",
      ten: "Cô lập, tẩy chay",
      cum: [
        "bị cô lập", "bị tẩy chay",
        "không ai chơi cùng", "cả lớp tránh mặt",
        "rủ nhau không chơi với em",
        "bị đuổi khỏi nhóm lớp",
        "bị loại khỏi nhóm học tập"
      ]
    },
    {
      id: "tin_don",
      ten: "Tung tin sai sự thật",
      cum: [
        "bị tung tin đồn", "bị bịa chuyện",
        "bị vu khống", "bị nói xấu",
        "đồn sai về em", "bịa tin về em"
      ]
    },
    {
      id: "rieng_tu",
      ten: "Xâm phạm hình ảnh và đời tư",
      cum: [
        "bị chụp lén", "đăng ảnh riêng tư",
        "bị phát tán ảnh", "bị tung ảnh",
        "bị ghép ảnh", "chế ảnh em",
        "bị lộ tin nhắn", "đăng tin nhắn riêng",
        "bị quay lén"
      ]
    },
    {
      id: "de_doa",
      ten: "Đe dọa, uy hiếp",
      cum: [
        "bị dọa đánh", "dọa sẽ đánh",
        "bị đe dọa", "dọa tung ảnh",
        "dọa tung bí mật", "dọa giết",
        "đe dọa em", "đe dọa đánh em"
      ]
    },
    {
      id: "the_chat",
      ten: "Bạo lực thể chất",
      cum: [
        "bị bạn đánh", "bị đánh",
        "bị đấm", "bị tát", "bị đá",
        "bị xô ngã", "bị hành hung",
        "bị đánh hội đồng", "bạn đánh em",
        "bị bóp cổ"
      ]
    },
    {
      id: "ep_buoc",
      ten: "Ép buộc, khống chế",
      cum: [
         "bị ép buộc",
        "bị ép đưa tiền", "bị ép làm bài hộ",
        "bị ép làm việc", "bị cưỡng ép",
        "bị khống chế", "bắt em phải đưa tiền",
        "ép em làm", "bị ép gửi ảnh"
      ]
    },
    {
      id: "quay_roi",
      ten: "Quấy rối, xâm phạm ranh giới",
      cum: [
        "bị quấy rối", "bị sờ soạng",
        "bị đụng chạm", "bị theo dõi",
        "nhắn tin quấy rối",
        "liên tục nhắn tin làm phiền",
        "bị gạ gẫm", "bị ép hôn"
      ]
    },
    {
      id: "mau_thuan",
      ten: "Mâu thuẫn và trả đũa",
      cum: [
        "cãi nhau với bạn",
        "mâu thuẫn với bạn", "giận nhau",
        "muốn trả đũa", "định trả thù",
        "xích mích với bạn",
        "tranh cãi với bạn"
      ]
    },
    {
      id: "tinh_cam",
      ten: "Tình cảm học đường",
      cum: [
         "vấn đề tình cảm",
        "chia tay người yêu", "ghen tuông",
        "bị ép quay lại", "người yêu cũ",
        "bị người yêu bỏ",
        "mâu thuẫn tình cảm",
        "người yêu đe dọa"
      ]
    },
    {
      id: "tien_bac",
      ten: "Tiền bạc, cờ bạc và vay nợ",
      cum: [
        "mượn tiền không trả", "bị đòi nợ",
        "bạn nợ tiền", "vay tiền qua app",
        "vay nóng", "đánh bài trên mạng",
        "đánh bài ăn tiền", "chơi tài xỉu",
        "cá cược online", "thua tiền cá cược"
      ]
    },
    {
      id: "lua_dao",
      ten: "Lừa đảo và an toàn tài khoản",
      cum: [
         "bị lừa đảo trực tuyến",
        "bị lừa đảo",
        "bị lừa chuyển khoản", "bị lừa tiền",
        "bị chiếm tài khoản",
        "bị hack tài khoản",
        "bị lấy mật khẩu",
        "bị lừa cung cấp otp",
        "đường link giả mạo",
        "bị giả mạo tài khoản"
      ]
    },
    {
      id: "hoc_tap",
      ten: "Khó khăn học tập và tâm lý",
      cum: [
        "bị điểm kém", "điểm thấp",
        "áp lực điểm số", "áp lực học tập",
        "sợ thi trượt", "lo thi không đậu",
        "học hành sa sút",
        "bị chê học dốt",
        "lo lắng kéo dài",
        "mất ngủ vì học", "sợ kiểm tra"
      ]
    }
  ];

  function chuanHoa(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const PHU_DINH = new Set([
    "khong", "ko", "k", "chua", "chang"
  ]);

  function biPhuDinh(words, viTri) {
    if (viTri > 0 && PHU_DINH.has(words[viTri - 1])) {
      return true;
    }
    if (
      viTri > 1 &&
      PHU_DINH.has(words[viTri - 2]) &&
      ["co", "he", "phai"].includes(words[viTri - 1])
    ) {
      return true;
    }
    return false;
  }

  const DANH_MUC = NHOM.map(nhom => ({
    ...nhom,
    mau: nhom.cum.map(chuanHoa)
  }));

  function phanLoaiTinhHuong(noiDung) {
    const vanBan = chuanHoa(noiDung);

    if (!vanBan) {
      return {
        nhomChinh: null,
        nhomPhu: [],
        nhom: [],
        canLamRo: true
      };
    }

    const words = vanBan.split(" ");

    const ketQua = DANH_MUC.map(nhom => {
      const cumKhop = [];

      nhom.mau.forEach((mau, i) => {
        const cumWords = mau.split(" ");

        for (
          let j = 0;
          j <= words.length - cumWords.length;
          j++
        ) {
          const khop = cumWords.every(
            (word, k) => words[j + k] === word
          );

          if (khop && !biPhuDinh(words, j)) {
            cumKhop.push(nhom.cum[i]);
            break;
          }
        }
      });

      return {
        id: nhom.id,
        ten: nhom.ten,
        diem: cumKhop.length,
        cumKhop
      };
    })
      .filter(nhom => nhom.diem > 0)
      .sort((a, b) => b.diem - a.diem);

    return {
      nhomChinh: ketQua[0]?.ten || null,
      nhomPhu: ketQua.slice(1).map(n => n.ten),
      nhom: ketQua.map(n => n.ten),
      canLamRo: ketQua.length === 0
    };
  }

  const api = Object.freeze({
    NHOM_TINH_HUONG: NHOM,
    chuanHoaVanBan: chuanHoa,
    phanLoaiTinhHuong
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.CoGiaoAIPhanLoai = api;
  }

})(typeof window !== "undefined" ? window : undefined);
