
/* CO GIAO AI - Bo phan loai 14 nhom, ban thu nghiem 2.0
   Chi phan loai tren trinh duyet; khong tu gui hay luu noi dung hoc sinh.
   Can kiem thu va danh gia thu cong truoc khi su dung chinh thuc.
*/
(function (root) {
  "use strict";

  const NHOM = [
   
{id:"che_gieu_ngoai_hinh",ten:"Chế giễu, xúc phạm",cum:[

      "bị chửi","bạn chửi em","bị chế giễu","bị miệt thị",
      "chê ngoại hình","chế giễu ngoại hình","gọi biệt danh xúc phạm",
      "bằng biệt danh xúc phạm","biệt danh xúc phạm",
      "body shaming","bị sỉ nhục","bị xúc phạm",
      "lấy em ra làm trò cười","làm trò cười trước lớp",
      "chửi em","chọc quê em"
    ]},
    {id:"bat_nat_lap_lai",ten:"Bắt nạt lặp lại",cum:[
      "bị bắt nạt nhiều lần","bị trêu chọc nhiều lần",
      "ngày nào cũng trêu","liên tục bắt nạt",
      "đã bảo dừng nhưng vẫn tiếp tục","bị bắt nạt suốt",
      "suốt tuần nào các bạn cũng kiếm chuyện trêu",
      "tuần nào cũng kiếm chuyện trêu",
      "ngày nào cũng kiếm chuyện",
      "lặp đi lặp lại việc bắt nạt"
    ]},
    {id:"co_lap",ten:"Cô lập, tẩy chay",cum:[
      "bị cô lập","bị tẩy chay","không ai chơi cùng",
      "cả lớp tránh mặt","rủ nhau không chơi với em",
      "bị đuổi khỏi nhóm lớp","bị loại khỏi nhóm học tập",
      "không cho em tham gia hoạt động chung",
      "không cho em tham gia nhóm",
      "cả nhóm không cho em tham gia"
    ]},
    {id:"tin_don",ten:"Tung tin sai sự thật",cum:[
      "bị tung tin đồn","tung tin đồn","bị bịa chuyện",
      "bị vu khống","bị nói xấu","đồn sai về em",
      "bịa tin về em","bịa ra chuyện không có thật",
      "bịa chuyện về em","lan truyền tin đồn"
    ]},
    {id:"rieng_tu",ten:"Xâm phạm hình ảnh và đời tư",cum:[
      "bị chụp lén","đăng ảnh riêng tư",
       "chụp lúc em ngủ gật",
      "bị phát tán ảnh","bị tung ảnh",
      "bị ghép ảnh","chế ảnh em",
      "bị lộ tin nhắn","đăng tin nhắn riêng",
      "bị quay lén","chụp màn hình tin nhắn riêng",
      "đem đăng tin nhắn riêng",
      "đăng ảnh của em khi chưa xin phép"
    ]},
    {id:"de_doa",ten:"Đe dọa, uy hiếp",cum:[
      "bị dọa đánh","dọa sẽ đánh","bị đe dọa",
      "dọa tung ảnh","dọa tung bí mật",
      "dọa giết","đe dọa em","đe dọa đánh em",
      "sẽ xử em","mách cô thì sẽ xử",
      "nếu mách cô thì","đe dọa"
    ]},
    {id:"the_chat",ten:"Bạo lực thể chất",cum:[
      "bị bạn đánh","bị đánh","bị đấm",
      "bị tát","bị đá","bị xô ngã",
      "bị hành hung","bị đánh hội đồng",
      "bạn đánh em","bị bóp cổ",
      "đấm em","tát em","đá em","xô em ngã"
    ]},
    {id:"ep_buoc",ten:"Ép buộc, khống chế",cum:[
      "bị ép buộc","bị ép đưa tiền",
      "bị ép làm bài hộ","bị ép làm việc",
      "bị cưỡng ép","bị khống chế",
      "bắt em phải đưa tiền","ép em làm",
      "bị ép gửi ảnh","bắt em làm bài tập thay",
      "bắt em làm bài thay",
      "không làm thì bị phạt","ép em đưa tiền"
    ]},
    {id:"quay_roi",ten:"Quấy rối, xâm phạm ranh giới",cum:[
      "bị quấy rối","bị sờ soạng",
      "bị đụng chạm","bị theo dõi",
      "nhắn tin quấy rối",
      "liên tục nhắn tin làm phiền",
      "bị gạ gẫm","bị ép hôn",
      "đụng chạm vào người dù em đã từ chối",
      "đụng chạm vào người",
      "cứ sờ vào người em"
    ]},
    {id:"mau_thuan",ten:"Mâu thuẫn và trả đũa",cum:[
      "cãi nhau với bạn","mâu thuẫn với bạn",
      "giận nhau","muốn trả đũa",
      "định trả thù","xích mích với bạn",
      "tranh cãi với bạn","nghĩ cách trả thù",
      "muốn trả thù","tìm cách trả đũa"
    ]},
    {id:"tinh_cam",ten:"Tình cảm học đường",cum:[
      "vấn đề tình cảm","chia tay người yêu",
      "ghen tuông","bị ép quay lại",
      "người yêu cũ","bị người yêu bỏ",
      "mâu thuẫn tình cảm","người yêu đe dọa",
      "người em thích đòi chia tay",
      "người em thích chia tay",
      "bạn trai chia tay","bạn gái chia tay"
    ]},
    {id:"tien_bac",ten:"Tiền bạc, cờ bạc và vay nợ",cum:[
   "vay tiền nhưng không trả","vay tiền","nợ tiền em","nợ em",
      "mượn tiền không trả","bị đòi nợ",
      


      "vay nóng","đánh bài trên mạng",
      "đánh bài ăn tiền","chơi tài xỉu",
      "cá cược online","thua tiền cá cược",
      "mượn 200 nghìn mãi chưa trả",
      "mượn tiền mãi chưa trả",
      "mượn tiền chưa trả",
      "mượn tiền em chưa trả"
    ]},
    {id:"lua_dao",ten:"Lừa đảo và an toàn tài khoản",cum:[
      "bị lừa đảo trực tuyến","bị lừa đảo",
      "bị lừa chuyển khoản","bị lừa tiền",
      "bị chiếm tài khoản","bị hack tài khoản",
      "bị lấy mật khẩu","bị lừa cung cấp otp",
      "đường link giả mạo",
      "bị giả mạo tài khoản",
      "gửi link giả để lấy mật khẩu",
      "link giả để lấy mật khẩu",
      "lấy mật khẩu của em"
    ]},
    {id:"hoc_tap",ten:"Khó khăn học tập và tâm lý",cum:[
      "bị điểm kém","điểm thấp",
      "áp lực điểm số","áp lực học tập",
      "sợ thi trượt","lo thi không đậu",
      "học hành sa sút","bị chê học dốt",
      "lo lắng kéo dài","mất ngủ vì học",
      "sợ kiểm tra",
      "sợ đi học vì điểm số cứ giảm",
      "điểm số cứ giảm","điểm số giảm"
    ]}
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

  const DANH_MUC = NHOM.map(n => ({
    ...n,
    mau: n.cum.map(chuanHoa)
  }));

  const PHU_DINH = new Set([
    "khong", "ko", "k", "chua", "chang"
  ]);

  const PHU_DINH_NOI = new Set([
    "bi", "co", "he", "phai",
    "muon", "tung", "duoc", "con"
  ]);

  function biPhuDinh(words, viTri, doDai, mau) {
    // Mot so cum co "khong" nhung la hanh vi co lap.
    if (
      /^(khong ai choi cung|khong cho em tham gia|ca nhom khong cho)/
        .test(mau)
    ) {
      return false;
    }

    const dau = Math.max(0, viTri - 4);
    const truoc = words.slice(dau, viTri);
    const phu = truoc.findLastIndex(
      w => PHU_DINH.has(w)
    );

    if (phu >= 0) {
      const giua = truoc.slice(phu + 1);
      if (
        giua.length <= 2 &&
        giua.every(w => PHU_DINH_NOI.has(w))
      ) {
        return true;
      }
    }

    const trong = words.slice(
      viTri,
      viTri + Math.min(doDai, 3)
    );

    if (
      PHU_DINH.has(trong[0]) &&
      trong.slice(1, 3).every(
        w => PHU_DINH_NOI.has(w)
      )
    ) {
      return true;
    }

    return false;
  }

  const BOI_CANH_THAM_KHAO = [
    "em chi doc bai bao",
    "em dang hoc cach phong tranh",
    "em muon tim hieu ve",
     "em chi muon tim hieu ve",
    "em nghe ke mot nguoi khac",
    "ban noi dua rang"
  ];

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

    // Tach menh de de phu dinh khong lan sang
    // phan sau tu "nhung".
    const menhDe = String(noiDung)
      .split(/\bnhưng\b|\bnhung\b|[.!?;\n]+/iu)
      .map(chuanHoa)
      .filter(Boolean);

    const diem = new Map(
      NHOM.map(n => [
        n.id,
        {
          id: n.id,
          ten: n.ten,
          diem: 0,
          cumKhop: []
        }
      ])
    );

    for (const menh of menhDe) {
      if (
        BOI_CANH_THAM_KHAO.some(
          x => menh.startsWith(x)
        )
      ) {
        continue;
      }

      const words = menh.split(" ");

      for (const nhom of DANH_MUC) {
        nhom.mau.forEach((mau, i) => {
          const cumWords = mau.split(" ");

          for (
            let j = 0;
            j <= words.length - cumWords.length;
            j++
          ) {
            const khop = cumWords.every(
              (w, k) => words[j + k] === w
            );

            if (!khop) continue;

            if (
              !biPhuDinh(
                words, j, cumWords.length, mau
              )
            ) {
              const item = diem.get(nhom.id);
              item.diem++;
              item.cumKhop.push(nhom.cum[i]);
            }

            break;
          }
        });
      }
    }

    const ketQua = [...diem.values()]
      .filter(n => n.diem > 0)
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

  if (
    typeof module !== "undefined" &&
    module.exports
  ) {
    module.exports = api;
  }

  if (root) {
    root.CoGiaoAIPhanLoai = api;
  }

})(typeof window !== "undefined" ? window : undefined);
