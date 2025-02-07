const post_content = document.getElementById("post_content");
const post_template = document.getElementById("post_template");
const page_next = document.getElementById("page_next");
const page_prev = document.getElementById("page_prev");

function image_thumb(img_url){
  if (img_url && img_url.includes(".cloudinary.com")){
    const search_txt ="/upload/";
    const transformation = "c_fill_pad,g_auto,h_200,w_200"
    const replace_txt ="/upload/"+transformation+"/";
    return img_url.replace(search_txt, replace_txt);
  }
  return img_url;
}

function tags_convert(tags){
  if (tags) {
    const result = []
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      if (element){
        tag_a = document.createElement("a");
        tag_a.href = "?tag="+element;
        tag_a.innerHTML = "#"+element;
        result.push(tag_a.outerHTML);
      }
    }
    return result.join(" ");
  }
}

function createPost(post) {
  const clone = post_template.content.cloneNode(true);
  clone.querySelector("p.card-text").innerText = post?.description;
  const img = clone.querySelector("img");
  img.src = image_thumb(post?.url_original);
  img.alt = post?.id;  
  const img_url = clone.querySelector("a.view_img");
  img_url.href = post?.url_original;
  const date_cr = clone.querySelector("small.date-cr");
  if (post?.created_at) date_cr.innerHTML = post?.created_at;
  const tags = clone.querySelector("p.tags");
  if (post?.tags) {
    tags.innerHTML = tags_convert(post?.tags);
  }
  post_content.appendChild(clone);
}

let token = localStorage.getItem("access_token");

//const BASE_URL = "";

//console.log(`token=${token}`);

function showMessage(msg) {
  alert(msg);
}

function setLoading(target) {
  post_content.classList.remove("row-cols-md-4");
  target.innerHTML = '<div class="alert alert-primary text-center" role="alert">Loading...</div>';
}

function setLoaded(target) {
  target.innerHTML = "";
  post_content.classList.add("row-cols-md-4");
}

get_refresh_token = async () => {
  get_refresh_token.counter = (get_refresh_token.counter || 0) + 1;
  if (get_refresh_token > 1) {
    console.log("get_refresh_token is busy, try later");
    return;
  }
  const URL = `${BASE_URL}/api/auth/refresh_token`;
  let refresh_token = localStorage.getItem("refresh_token");
  console.log(`refresh_token. token=${token}, refresh_token=${refresh_token}`);

  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  });

  if (response.ok) {
    result = await response.json();
    localStorage.setItem("access_token", result?.access_token);
    localStorage.setItem("refresh_token", result?.refresh_token);
    token = localStorage.getItem("access_token");
    // refresh_token = localStorage.getItem("refresh_token");
    get_refresh_token.counter = 0;
    return token;
  } else if (response.status == 401) {
    //window.location = "index.html";
    get_refresh_token.counter = 0;
  } else {
    get_refresh_token.counter = 0;
  }
  get_refresh_token.counter = 0;
};

get_user_info = async () => {
  const URL = `${BASE_URL}/api/users/me/`;
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.ok) {
    item = await response.json();
    if (item) {
      return item;
    }
  } else if (response.status == 401) {
    if (get_posts.counter < 4) {
      console.log(`Try: refresh_token counter: ${get_posts.counter}`);
      token = await get_refresh_token();
      setTimeout(get_posts, 3000);
    } else {
      window.location = "index.html";
    }
  }
};

function get_args() {
  let page = 0
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  read_page = parseInt(urlParams.get("page",0), 10);
  if (read_page){
    page = read_page;
  }
  
  page_next.href = "?page=" + (page + 1);
  if (page > 0) {
    page_prev.href = "?page=" + (page - 1);
  }
  return page;
}

get_posts = async () => {
  setLoading(post_content);
  let user_id;
  const user_info = await get_user_info();
  if (user_info) {
    user_id = user_info.id;
  }

  //setLoading(user_profile);
  const page = get_args();
  const limit = 12;
  const offset = limit*page;
  const URL = `${BASE_URL}/posts/user/${user_id}?limit=${limit}&offset=${offset}`;
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.ok) {
    posts = await response.json();
    if (posts) {
      setLoaded(post_content);
      posts.forEach((element) => {
        createPost(element);
      });
    }
  } else if (response.status == 401) {
    if (get_posts.counter < 4) {
      console.log(`Try: refresh_token counter: ${get_posts.counter}`);
      token = await get_refresh_token();
      setTimeout(get_posts, 3000);
    } else {
      window.location = "index.html";
    }
  }
};

// ownerCreate.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const URL = `${BASE_URL}/api/user_profile/`;
//   const raw = JSON.stringify({
//     email: ownerCreate?.email?.value,
//   });
//   const response = await fetch(URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: raw,
//   });
//   if (response.status == 201) {
//     ownerCreate.reset();
//     get_posts();
//   } else if (response.status == 401) {
//     token = await get_refresh_token();
//     console.log("Try again");
//   } else {
//     window.location = "index.html";
//   }
// });

// get_cats();
get_posts();

// setTimeout(() => {
//   get_cats();
// }, 15000);
// setTimeout(()=>{get_cats},15000);

// const form = document.getElementById("form_username");

// form?.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const button = document.querySelector('input[type="submit"]');
//   if (button) {
//     button.setAttribute("disabled", true);
//   }
//   const t = e.target;
//   const username = t.username.value;
//   const data = {
//     username: username,
//   };
//   const URL = `${BASE_URL}/api/users/me/`;
//   await fetch(URL, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(data),
//   })
//     .then((response) => {
//       if (button) {
//         button.removeAttribute("disabled");
//       }
//       if (response.status >= 500) {
//         throw "ERROR STATUS: " + response.status;
//       }
//       if (response.status < 400) {
//         //window.location = "confirm.html";
//       }
//       return response.json();
//     })
//     .then((json) => {
//       console.log(json);
//       detail = json?.detail;
//       err = "";
//       if (Array.isArray(detail)) {
//         for (const d of detail) {
//           const loc = d.loc[1];
//           const mgs = d.msg;
//           err = err + " " + loc + ": " + mgs;
//           console.log(d);
//         }
//       } else {
//         err = detail;
//       }
//       if (err) {
//         showMessage(err);
//       }
//     })
//     .catch((err) => {
//       console.log("ERROR", err);
//       showMessage(err);
//     });
// });

// const avatar_img = document.getElementById("avatar");
// const avatar_upload = document.getElementById("avatar_upload");
// const form_avatar = document.getElementById("form_avatar");

// async function send_img(t) {
//   // e.preventDefault();
//   // const t = e.target;
//   //t.preventDefault();
//   //const  w =avatar_img.clientWidth ;
//   avatar_img.src = "";
//   //avatar_img.clientWidth=w;
//   avatar_img.src = "/static/client/images/loading.gif";
//   const formData = new FormData(t);
//   const URL = `${BASE_URL}/api/users/avatar/`;
//   await fetch(URL, {
//     method: "PATCH",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: formData,
//   })
//     .then((response) => {
//       if (response.status >= 500) {
//         throw "ERROR STATUS: " + response.status;
//       }
//       if (response.status < 400) {
//         //window.location = "confirm.html";
//       }
//       return response.json();
//     })
//     .then((json) => {
//       console.log(json);
//       if (json?.avatar) {
//         avatar_img.src = json?.avatar;
//       }
//       detail = json?.detail;
//       err = "";
//       if (Array.isArray(detail)) {
//         for (const d of detail) {
//           const loc = d.loc[1];
//           const mgs = d.msg;
//           err = err + " " + loc + ": " + mgs;
//           console.log(d);
//         }
//       } else {
//         err = detail;
//       }
//       if (err) {
//         showMessage(err);
//       }
//     })
//     .catch((err) => {
//       console.log("ERROR", err);
//       showMessage(err);
//     });
// }

// form_avatar.addEventListener("submit", send_img);

// avatar_img?.addEventListener("click", async (e) => {
//   e.preventDefault();
//   avatar_upload?.click();
// });

// avatar_upload?.addEventListener("change", (e) => {
//   e.preventDefault();
//   //form_avatar.submit();
//   send_img(form_avatar);
// });
