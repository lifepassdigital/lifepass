```javascript
import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://dwidvbltikjmvfaxfrul.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Au1Agb96Uh5JCdtIQGW0tA_Was0dyLm";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ============================================================
// HELPER
// ============================================================

function $(id) {
  return document.getElementById(id);
}


// ============================================================
// GENERATE LIFEPASS ID
// ============================================================

function generateLifePassId() {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return "LP-" + code;
}


// ============================================================
// NAVIGATION
// ============================================================

window.scrollToSection = function(sectionId) {

  const section = $(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }

};


// ============================================================
// LOGIN MODAL
// ============================================================

window.openLogin = function() {

  $("loginModal")?.classList.add("active");

};


window.closeLogin = function() {

  $("loginModal")?.classList.remove("active");

};


// ============================================================
// CREATE PASSPORT MODAL
// ============================================================

window.openCreatePassport = async function() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {

    alert(
      "Please login before creating a LIFEPASS passport."
    );

    openLogin();

    return;
  }

  $("createModal")?.classList.add("active");

};


window.closeCreatePassport = function() {

  $("createModal")?.classList.remove("active");

};


// ============================================================
// GOOGLE LOGIN
// ============================================================

window.loginWithGoogle = async function() {

  const message = $("loginMessage");

  if (message) {
    message.textContent =
      "Opening Google sign-in...";
  }

  const { error } =
    await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {
        redirectTo:
          window.location.origin +
          window.location.pathname
      }

    });


  if (error) {

    if (message) {
      message.textContent =
        error.message;
      message.style.color =
        "#f87171";
    }

  }

};


// ============================================================
// EMAIL LOGIN
// ============================================================

window.loginWithEmail = async function() {

  const email =
    $("loginEmail")?.value.trim();

  const password =
    $("loginPassword")?.value;


  if (!email || !password) {

    showLoginMessage(
      "Enter your email and password."
    );

    return;
  }


  showLoginMessage(
    "Signing in..."
  );


  const { error } =
    await supabase.auth.signInWithPassword({

      email,
      password

    });


  if (error) {

    showLoginMessage(
      error.message
    );

    return;
  }


  showLoginMessage(
    "Login successful.",
    true
  );


  setTimeout(() => {

    closeLogin();

    updateLoginButton();

  }, 700);

};


// ============================================================
// EMAIL SIGNUP
// ============================================================

window.signupWithEmail = async function(
  email,
  password
) {

  const { data, error } =
    await supabase.auth.signUp({

      email,
      password

    });


  if (error) {

    return {
      success: false,
      error: error.message
    };

  }


  return {
    success: true,
    data
  };

};


// ============================================================
// LOGOUT
// ============================================================

window.logout = async function() {

  const { error } =
    await supabase.auth.signOut();


  if (error) {

    console.error(error);

    return;
  }


  updateLoginButton();

};


// ============================================================
// LOGIN MESSAGE
// ============================================================

function showLoginMessage(
  message,
  success = false
) {

  const element =
    $("loginMessage");

  if (!element) return;

  element.textContent =
    message;

  element.style.color =
    success
      ? "#4ade80"
      : "#f87171";

}


// ============================================================
// UPDATE LOGIN BUTTON
// ============================================================

async function updateLoginButton() {

  const {
    data: { user }
  } = await supabase.auth.getUser();


  const buttons =
    document.querySelectorAll(
      ".login-btn"
    );


  buttons.forEach(button => {

    if (user) {

      button.textContent =
        "Account";

      button.onclick = () => {

        alert(
          "Signed in as:\n" +
          user.email
        );

      };

    } else {

      button.textContent =
        "Login";

      button.onclick =
        openLogin;

    }

  });

}


// ============================================================
// CREATE PASSPORT
// ============================================================

window.createPassport = async function(event) {

  event.preventDefault();


  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();


  if (userError || !user) {

    showFormMessage(
      "Please login first."
    );

    return;
  }


  // ----------------------------------------------------------
  // GET FORM VALUES
  // ----------------------------------------------------------

  const productName =
    $("productName")?.value.trim();

  const productType =
    $("productType")?.value;

  const brand =
    $("brand")?.value.trim();

  const model =
    $("model")?.value.trim();

  const serial =
    $("serial")?.value.trim();

  const purchaseDate =
    $("purchaseDate")?.value || null;

  const warranty =
    $("warranty")?.value.trim();

  const purchasePrice =
    $("purchasePrice")?.value
      ? Number(
          $("purchasePrice").value
        )
      : null;

  const ownerName =
    $("ownerName")?.value.trim();

  const ownerEmail =
    $("ownerEmail")?.value.trim();

  const description =
    $("description")?.value.trim();


  if (!productName) {

    showFormMessage(
      "Please enter the product name."
    );

    return;
  }


  if (!productType) {

    showFormMessage(
      "Please select the product type."
    );

    return;
  }


  showFormMessage(
    "Creating your passport..."
  );


  // ----------------------------------------------------------
  // GENERATE PUBLIC LIFEPASS ID
  // ----------------------------------------------------------

  const lifePassId =
    generateLifePassId();


  // ----------------------------------------------------------
  // IMPORTANT
  //
  // DO NOT PUT lifePassId INTO `id`.
  //
  // Supabase automatically generates:
  //
  // id = UUID
  //
  // We store:
  //
  // lifepass_id = LP-XXXXXXXX
  // ----------------------------------------------------------

  const productData = {

    user_id: user.id,

    lifepass_id: lifePassId,

    name:
      productName,

    type:
      productType,

    brand:
      brand || null,

    model:
      model || null,

    serial:
      serial || null,

    purchase_date:
      purchaseDate,

    purchase_price:
      purchasePrice,

    warranty:
      warranty || null,

    owner_name:
      ownerName ||
      user.user_metadata?.full_name ||
      null,

    owner_email:
      ownerEmail ||
      user.email,

    description:
      description || null,

    verified:
      false,

    verification_status:
      "pending",

    history: [
      {
        event:
          "Passport Created",

        date:
          new Date().toISOString(),

        note:
          "LIFEPASS passport created."
      }
    ],

    ownership_history: [
      {
        owner:
          ownerName ||
          user.user_metadata?.full_name ||
          user.email,

        email:
          ownerEmail ||
          user.email,

        date:
          new Date().toISOString()
      }
    ],

    service_history: [],

    documents: [],

    metadata: {
      source:
        window.location.origin
    },

    status:
      "active"

  };


  console.log(
    "Sending product data:",
    productData
  );


  // ----------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------

  const {
    data,
    error
  } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();


  if (error) {

    console.error(
      "SUPABASE INSERT ERROR:",
      error
    );

    showFormMessage(
      error.message
    );

    return;
  }


  // ----------------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------------

  showFormMessage(
    "Passport created: " +
    lifePassId,
    true
  );


  console.log(
    "Created passport:",
    data
  );


  setTimeout(() => {

    closeCreatePassport();

    $("passportForm")?.reset();

    showPassportCreated(
      data
    );

  }, 900);

};


// ============================================================
// SUCCESS CARD
// ============================================================

function showPassportCreated(product) {

  const result =
    $("searchResult");

  if (!result) return;


  result.style.display =
    "block";


  result.innerHTML = `

    <div style="
      background:#0c192b;
      border:1px solid rgba(74,222,128,.35);
      border-radius:18px;
      padding:25px;
    ">

      <div style="
        color:#4ade80;
        font-weight:800;
        margin-bottom:12px;
      ">
        ✓ PASSPORT CREATED
      </div>

      <h3 style="
        margin-bottom:10px;
      ">
        ${escapeHTML(
          product.name ||
          "Product"
        )}
      </h3>

      <div style="
        color:#94a3b8;
        font-size:13px;
        margin-bottom:7px;
      ">
        LIFEPASS ID
      </div>

      <div style="
        color:#67e8f9;
        font-size:24px;
        font-weight:800;
      ">
        ${escapeHTML(
          product.lifepass_id
        )}
      </div>

      <button
        class="primary-btn"
        style="margin-top:20px;"
        onclick="searchPassportById('${escapeAttribute(
          product.lifepass_id
        )}')"
      >
        View Passport
      </button>

    </div>

  `;


  result.scrollIntoView({
    behavior: "smooth"
  });

}


// ============================================================
// SEARCH PASSPORT
// ============================================================

window.searchPassport = async function() {

  const input =
    $("passportSearch");

  if (!input) return;


  const lifepassId =
    input.value
      .trim()
      .toUpperCase();


  if (!lifepassId) {

    showSearchMessage(
      "Enter a LIFEPASS ID."
    );

    return;
  }


  await searchPassportById(
    lifepassId
  );

};


window.searchPassportById =
  async function(lifepassId) {

    lifepassId =
      String(lifepassId)
        .trim()
        .toUpperCase();


    showSearchMessage(
      "Searching..."
    );


    const {
      data,
      error
    } = await supabase
      .from("products")
      .select(`
        id,
        lifepass_id,
        name,
        type,
        brand,
        model,
        serial,
        purchase_date,
        warranty,
        owner_name,
        verified,
        verification_status,
        description,
        image,
        created_at
      `)
      .eq(
        "lifepass_id",
        lifepassId
      )
      .maybeSingle();


    if (error) {

      console.error(
        "SEARCH ERROR:",
        error
      );

      showSearchMessage(
        error.message
      );

      return;
    }


    if (!data) {

      showSearchMessage(
        "No passport found for " +
        lifepassId
      );

      return;
    }


    displayPassport(
      data
    );

  };


// ============================================================
// DISPLAY PASSPORT
// ============================================================

function displayPassport(product) {

  const result =
    $("searchResult");

  if (!result) return;


  result.style.display =
    "block";


  const verified =
    product.verified === true ||
    product.verification_status ===
      "approved";


  result.innerHTML = `

    <div style="
      background:#0c192b;
      border:1px solid rgba(255,255,255,.1);
      border-radius:20px;
      padding:25px;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        gap:15px;
        flex-wrap:wrap;
        margin-bottom:20px;
      ">

        <div>

          <div style="
            color:#67e8f9;
            font-size:11px;
            font-weight:800;
            letter-spacing:2px;
          ">
            LIFEPASS DIGITAL PASSPORT
          </div>

          <h2 style="
            margin-top:8px;
          ">
            ${escapeHTML(
              product.name ||
              "Product"
            )}
          </h2>

        </div>

        <div style="
          color:${
            verified
              ? "#4ade80"
              : "#fbbf24"
          };
          font-weight:800;
        ">
          ${
            verified
              ? "● VERIFIED"
              : "● PENDING"
          }
        </div>

      </div>


      ${passportRow(
        "LIFEPASS ID",
        product.lifepass_id
      )}

      ${passportRow(
        "Product Type",
        product.type
      )}

      ${passportRow(
        "Brand",
        product.brand
      )}

      ${passportRow(
        "Model",
        product.model
      )}

      ${passportRow(
        "Serial",
        product.serial
      )}

      ${passportRow(
        "Purchase Date",
        product.purchase_date
      )}

      ${passportRow(
        "Warranty",
        product.warranty
      )}

      ${passportRow(
        "Owner",
        product.owner_name
      )}


      <div style="
        margin-top:20px;
        padding:15px;
        border-radius:12px;
        background:#07111f;
        color:#94a3b8;
        line-height:1.6;
      ">
        ${escapeHTML(
          product.description ||
          "No description available."
        )}
      </div>

    </div>

  `;


  result.scrollIntoView({
    behavior: "smooth"
  });

}


// ============================================================
// PASSPORT ROW
// ============================================================

function passportRow(
  label,
  value
) {

  return `

    <div style="
      display:flex;
      justify-content:space-between;
      gap:15px;
      padding:13px 0;
      border-top:1px solid rgba(255,255,255,.07);
      color:#94a3b8;
      font-size:14px;
    ">

      <span>
        ${escapeHTML(label)}
      </span>

      <strong style="
        color:white;
        text-align:right;
      ">
        ${escapeHTML(
          value || "-"
        )}
      </strong>

    </div>

  `;

}


// ============================================================
// SEARCH MESSAGE
// ============================================================

function showSearchMessage(
  message
) {

  const result =
    $("searchResult");

  if (!result) return;


  result.style.display =
    "block";


  result.innerHTML = `

    <div style="
      background:#0c192b;
      border:1px solid rgba(255,255,255,.08);
      border-radius:15px;
      padding:20px;
      text-align:center;
      color:#94a3b8;
    ">
      ${escapeHTML(message)}
    </div>

  `;

}


// ============================================================
// FORM MESSAGE
// ============================================================

function showFormMessage(
  message,
  success = false
) {

  const element =
    $("formMessage");

  if (!element) return;


  element.textContent =
    message;

  element.style.color =
    success
      ? "#4ade80"
      : "#f87171";

}


// ============================================================
// AI ASSISTANT
// ============================================================

window.openAI = function() {

  alert(
    "LIFEPASS Assistant\n\n" +
    "Ask about your LIFEPASS passport, " +
    "product history, warranty or verification."
  );

};


// ============================================================
// SECURITY / HTML ESCAPING
// ============================================================

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return String(value)
    .replaceAll(
      "\\",
      "\\\\"
    )
    .replaceAll(
      "'",
      "\\'"
    );

}


// ============================================================
// AUTH STATE
// ============================================================

supabase.auth.onAuthStateChange(
  (event, session) => {

    console.log(
      "AUTH:",
      event
    );

    updateLoginButton();

  }
);


// ============================================================
// CLOSE MODALS BY CLICKING OUTSIDE
// ============================================================

window.addEventListener(
  "click",
  event => {

    const createModal =
      $("createModal");

    const loginModal =
      $("loginModal");


    if (
      createModal &&
      event.target === createModal
    ) {

      closeCreatePassport();

    }


    if (
      loginModal &&
      event.target === loginModal
    ) {

      closeLogin();

    }

  }
);


// ============================================================
// KEYBOARD SUPPORT
// ============================================================

window.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeCreatePassport();

      closeLogin();

    }

  }
);


// ============================================================
// START
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "LIFEPASS started."
    );

    await updateLoginButton();

  }
);
```
