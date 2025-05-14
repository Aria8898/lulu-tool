import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from "axios";
import qs from "qs";
// 继续请求的处理
const handleContinueReq = (error: any, cb?: Function) => {
  const {
    method,
    url,
    data,
    timeout,
    isContinueReqError,
    maxContinueReqNumber,
    currentContinueIndex,
  } = error.config;
  if (
    error.config.isContinueReqError &&
    error.config.maxContinueReqNumber > error.config.currentContinueIndex
  ) {
    return http({
      method,
      url,
      data,
      timeout,
      isContinueReqError,
      maxContinueReqNumber,
      currentContinueIndex: currentContinueIndex + 1,
    });
  }
  return cb ? cb() : Promise.reject(error);
};

export const handleRequestError = (error: any) => {
  const msg = error?.data?.msg;
  console.log("handleRequestError-msg: ", msg);
};

export const Request = axios.create({
  timeout: 20 * 1000,
});

// 请求前拦截
interface InternalHttpRequestConfig<D = any>
  extends InternalAxiosRequestConfig<D> {
  isContinueReqError?: boolean;
  maxContinueReqNumber?: number;
  currentContinueIndex?: number;
}
export const requestInterceptor = (config: InternalHttpRequestConfig) => {
  const language = localStorage.getItem("language") || "en";
  config.headers["Accept-Language"] = language;
  return config;
};

Request.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error);
});

// 响应后拦截
/**
 * 响应后拦截
 * @params type 1全返回 2只返回data数据
 * @return
 */
interface HttpResponse extends AxiosResponse {
  config: InternalHttpRequestConfig;
}
const createResponseIntercepter = (type: number) => {
  return async (res: HttpResponse) => {
    const resContent = type === 1 ? res.data : res;
    if (res && res.status === 200) {
      return Promise.resolve(resContent);
    }
    return Promise.reject(resContent);
  };
};

Request.interceptors.response.use(createResponseIntercepter(1), (error) =>
  Promise.reject(error)
);

export default Request;

interface Options<p = any> extends AxiosRequestConfig {
  baseUrl?: string;
  data?: p;
  url: string;
  method: string;
  timeout?: number;
  isContinueReqError?: boolean;
  maxContinueReqNumber?: number;
}
interface HttpRequestConfig<D> extends AxiosRequestConfig<D> {
  isContinueReqError?: boolean;
  maxContinueReqNumber?: number;
  currentContinueIndex?: number;
}
interface HttpInstance2 extends AxiosInstance {
  <T = any, R = AxiosResponse<T>, D = any>(
    config: HttpRequestConfig<D>
  ): Promise<R>;
}
const http: HttpInstance2 = axios.create({
  timeout: 20 * 1000,
});
http.interceptors.response.use(createResponseIntercepter(2), handleContinueReq);
http.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

export const api = <p = any, s = any>(options: Options<p>): Promise<s> => {
  console.log("opt-api: ", options);
  const {
    baseUrl = "",
    method,
    url: preUrl,
    data: preData,
    timeout,
    isContinueReqError = false,
    maxContinueReqNumber = 3,
    ...axiosConfig // 继承 Axios 的所有配置参数
  } = options;
  console.log("axiosConfig", axiosConfig);
  const url = method === "get" ? `${preUrl}?${qs.stringify(preData)}` : preUrl;
  return http({
    method,
    url: `${baseUrl}${url}`,
    data: preData,
    timeout,
    isContinueReqError,
    maxContinueReqNumber,
    currentContinueIndex: 1,
    ...axiosConfig, // 合并 Axios 配置
  });
};
